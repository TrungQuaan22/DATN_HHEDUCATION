from __future__ import annotations

from typing import Generator
import json
import time

from ai_client import embed_query, generate_answer, generate_answer_stream
from config import (
    CHAT_MODEL,
    CHAT_PROVIDER,
    LESSON_BOOST,
    RETRIEVAL_LIMIT,
    SIMILARITY_THRESHOLD,
)
from database import db_connection


def get_lesson_metadata(course_id: str, lesson_id: str | None) -> dict:
    course_title = None
    current_lesson_title = None
    current_lesson_description = None
    current_lesson_materials_count = 0

    with db_connection() as conn:
        with conn.cursor() as cursor:
            # Query course title
            cursor.execute('SELECT "title" FROM "courses" WHERE "id" = %s AND "deleted_at" IS NULL', (course_id,))
            course_row = cursor.fetchone()
            if course_row:
                course_title = course_row[0]

            if lesson_id:
                # Query current lesson title and description
                cursor.execute('SELECT "title", "description" FROM "lessons" WHERE "id" = %s AND "deleted_at" IS NULL', (lesson_id,))
                lesson_row = cursor.fetchone()
                if lesson_row:
                    current_lesson_title, current_lesson_description = lesson_row

                # Query if current lesson has materials
                cursor.execute('SELECT COUNT(*) FROM "lesson_materials" WHERE "lesson_id" = %s AND "deleted_at" IS NULL', (lesson_id,))
                materials_row = cursor.fetchone()
                if materials_row:
                    current_lesson_materials_count = int(materials_row[0])

    return {
        "course_title": course_title,
        "current_lesson_title": current_lesson_title,
        "current_lesson_description": current_lesson_description,
        "current_lesson_materials_count": current_lesson_materials_count,
    }


def retrieve_relevant_chunks(
    course_id: str,
    lesson_id: str | None,
    question: str,
) -> dict:
    question_vector = embed_query(question)
    question_vector_literal = "[" + ",".join(str(value) for value in question_vector) + "]"

    with db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    kc."id",
                    kc."content",
                    kc."lesson_id",
                    kc."material_id",
                    kc."source_type",
                    lm."title" AS material_title,
                    (1 - (kc."embedding_vector" <=> %s::vector)) AS base_similarity,
                    (
                        (1 - (kc."embedding_vector" <=> %s::vector)) +
                        (CASE WHEN %s IS NOT NULL AND kc."lesson_id" = %s THEN %s ELSE 0 END)
                    ) AS boosted_score
                FROM "knowledge_chunks" kc
                LEFT JOIN "lesson_materials" lm ON kc."material_id" = lm."id"
                WHERE kc."course_id" = %s
                  AND kc."embedding_vector" IS NOT NULL
                ORDER BY boosted_score DESC
                LIMIT %s
                """,
                (
                    question_vector_literal,
                    question_vector_literal,
                    lesson_id,
                    lesson_id,
                    LESSON_BOOST,
                    course_id,
                    RETRIEVAL_LIMIT,
                ),
            )
            rows = cursor.fetchall()

    context_parts: list[str] = []
    citations: list[dict] = []

    for index, row in enumerate(rows, start=1):
        chunk_id, content, chunk_lesson_id, material_id, source_type, material_title, base_similarity, score = row
        base_similarity = float(base_similarity)
        score = float(score)

        if base_similarity < SIMILARITY_THRESHOLD:
            continue

        source_title = material_title or (
            "Mô tả bài học" if source_type == "lesson_description" else "Tài liệu khóa học"
        )
        context_parts.append(
            f"[Context {index} | Nguồn: {source_title} | Similarity: {base_similarity:.4f}]\n{content}"
        )
        citations.append(
            {
                "chunk_id": str(chunk_id),
                "material_id": str(material_id) if material_id else None,
                "rank": index,
                "score": score,
                "base_similarity": base_similarity,
                "quote": content[:300],
                "source_title": source_title,
                "lesson_id": str(chunk_lesson_id) if chunk_lesson_id else None,
                "source_type": source_type,
            }
        )

    return {
        "context_parts": context_parts,
        "citations": citations,
        "retrieval": {
            "limit": RETRIEVAL_LIMIT,
            "similarity_threshold": SIMILARITY_THRESHOLD,
            "lesson_boost": LESSON_BOOST,
            "context_count": len(context_parts),
        },
    }


def run_rag_tutor(
    course_id: str,
    lesson_id: str | None,
    question: str,
    chat_history: list[dict[str, str]],
) -> dict:
    started_at = time.perf_counter()
    retrieval = retrieve_relevant_chunks(course_id=course_id, lesson_id=lesson_id, question=question)
    context_parts = retrieval["context_parts"]
    citations = retrieval["citations"]

    meta = get_lesson_metadata(course_id, lesson_id)
    context_text = "\n\n".join(context_parts)
    messages = build_prompt_messages(
        question=question,
        context_text=context_text,
        chat_history=chat_history,
        course_title=meta["course_title"],
        current_lesson_title=meta["current_lesson_title"],
        current_lesson_description=meta["current_lesson_description"],
        current_lesson_materials_count=meta["current_lesson_materials_count"],
    )
    answer = generate_answer(messages)

    return {
        "answer": answer,
        "citations": citations,
        "provider": CHAT_PROVIDER,
        "model_name": CHAT_MODEL,
        "latency_ms": int((time.perf_counter() - started_at) * 1000),
        "retrieval": retrieval["retrieval"],
    }


def run_rag_tutor_stream(
    course_id: str,
    lesson_id: str | None,
    question: str,
    chat_history: list[dict[str, str]],
) -> Generator[str, None, None]:
    retrieval = retrieve_relevant_chunks(course_id=course_id, lesson_id=lesson_id, question=question)
    context_parts = retrieval["context_parts"]
    citations = retrieval["citations"]

    # 1. Yield citations first
    yield f"event: citations\ndata: {json.dumps(citations)}\n\n"

    # 2. Yield text chunks as they are generated
    meta = get_lesson_metadata(course_id, lesson_id)
    context_text = "\n\n".join(context_parts)
    messages = build_prompt_messages(
        question=question,
        context_text=context_text,
        chat_history=chat_history,
        course_title=meta["course_title"],
        current_lesson_title=meta["current_lesson_title"],
        current_lesson_description=meta["current_lesson_description"],
        current_lesson_materials_count=meta["current_lesson_materials_count"],
    )

    for chunk_text in generate_answer_stream(messages):
        yield f"event: content\ndata: {json.dumps({'text': chunk_text})}\n\n"

    # 3. Yield final metadata event
    yield f"event: done\ndata: {json.dumps({'provider': CHAT_PROVIDER, 'model_name': CHAT_MODEL})}\n\n"


def build_prompt_messages(
    question: str,
    context_text: str,
    chat_history: list[dict[str, str]],
    course_title: str | None = None,
    current_lesson_title: str | None = None,
    current_lesson_description: str | None = None,
    current_lesson_materials_count: int = 0,
) -> list[dict[str, str]]:
    lesson_context_info = ""
    if course_title:
        lesson_context_info += f"- Khóa học hiện tại: {course_title}\n"
    if current_lesson_title:
        lesson_context_info += f"- Bài học hiện tại học sinh đang xem/học: {current_lesson_title}\n"
        if current_lesson_description:
            lesson_context_info += f"  Mô tả bài học: {current_lesson_description}\n"
        
        if current_lesson_materials_count == 0:
            lesson_context_info += "  LƯU Ý QUAN TRỌNG: Bài học hiện tại này CHƯA CÓ bất kỳ tài liệu học tập nào được tải lên.\n"
        else:
            lesson_context_info += f"  Bài học hiện tại có {current_lesson_materials_count} tài liệu học tập.\n"

    if context_text:
        system_instruction = f"""
Bạn là AI Tutor của hệ thống học trực tuyến HH Education.
Hãy trả lời bằng tiếng Việt, rõ ràng, có tính sư phạm.

Thông tin bối cảnh hiện tại của học sinh:
{lesson_context_info}

Quy tắc trả lời:
1. Chỉ dùng ngữ cảnh khóa học được cung cấp để trả lời các câu hỏi chuyên môn. Không tự bịa thêm thông tin ngoài tài liệu.
2. Trả lời tự nhiên như một gia sư đang giải thích cho học sinh. Không mở đầu bằng các cụm như "dựa vào tài liệu", "theo tài liệu", hoặc lặp lại cách nói tương tự trong mọi câu trả lời.
3. Nếu học sinh hỏi về nội dung của bài học hiện tại (ví dụ: "bài này dạy về cái gì", "tài liệu bài này nói gì") nhưng bài học hiện tại CHƯA CÓ tài liệu học tập (materials count = 0), hãy giải thích lịch sự rằng bài học này chưa được tải lên tài liệu học tập, và nếu cần có thể tham khảo tài liệu của các bài học khác trong khóa học. Tránh dùng tài liệu của bài học khác để giả vờ trả lời cho bài học hiện tại.
4. Khi sử dụng thông tin từ ngữ cảnh, bạn BẮT BUỘC phải trích dẫn nguồn bằng cách đặt ký hiệu trích dẫn dạng [index] (ví dụ: [1], [2]) ở ngay cuối câu hoặc mệnh đề chứa thông tin đó, tương ứng với số thứ tự [Context index] của tài liệu cung cấp. Không trích dẫn ở cuối cả bài nếu không cần thiết, hãy trích dẫn cụ thể ở cuối mỗi câu/mệnh đề liên quan. Ví dụ: "AI là ngành khoa học máy tính [1]. Nó giúp tự động hóa nhiều công việc [2]."
""".strip()
        user_content = f"Ngữ cảnh khóa học:\n{context_text}\n\nCâu hỏi học sinh:\n{question}"
    else:
        system_instruction = f"""
Bạn là AI Tutor của hệ thống học trực tuyến HH Education.

Thông tin bối cảnh hiện tại của học sinh:
{lesson_context_info}

Không tìm thấy đoạn tài liệu khóa học đủ liên quan để trả lời chắc chắn.
Hãy nói rõ rằng tài liệu hiện tại chưa cung cấp đủ thông tin, rồi gợi ý học sinh hỏi lại cụ thể hơn hoặc kiểm tra tài liệu bài học.
Không bịa nội dung bài học.
Nếu học sinh hỏi vì sao chưa thể trả lời ngay, hãy nói ngắn gọn rằng bạn cần thêm ngữ cảnh hoặc tài liệu liên quan để trả lời chính xác.
""".strip()
        user_content = f"Câu hỏi học sinh:\n{question}"

    messages = [{"role": "system", "content": system_instruction}]
    for message in chat_history[-6:]:
        if message.get("role") in {"user", "assistant"} and message.get("content"):
            messages.append({"role": message["role"], "content": message["content"]})
    messages.append({"role": "user", "content": user_content})

    return messages

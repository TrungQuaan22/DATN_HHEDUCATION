from __future__ import annotations

import os
import tempfile

import requests

from knowledge_indexer import persist_knowledge_chunks
from database import db_connection
from document_loaders import extract_text_from_file


def download_to_temp_file(file_url: str, material_type: str) -> str:
    suffix = f".{material_type}"
    fd, path = tempfile.mkstemp(prefix="lesson-material-", suffix=suffix)
    os.close(fd)

    response = requests.get(file_url, stream=True, timeout=60)
    response.raise_for_status()

    with open(path, "wb") as file:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                file.write(chunk)

    return path


def run_ingestion(
    material_id: str,
    media_id: str | None,
    course_id: str,
    lesson_id: str,
    material_type: str,
    title: str | None = None,
    file_url: str | None = None,
    content_text: str | None = None,
) -> bool:
    local_path: str | None = None
    text_content = (content_text or "").strip()

    try:
        if material_type in {"pdf", "docx", "pptx"}:
            if not file_url:
                raise ValueError("file_url is required for file lesson materials")
            local_path = download_to_temp_file(file_url, material_type)
            text_content = extract_text_from_file(local_path, material_type).strip()

        if not text_content:
            raise ValueError("No text could be extracted from the lesson material")

        with db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE "lesson_materials"
                    SET "extracted_text" = %s,
                        "processing_status" = 'ready',
                        "processing_error" = NULL,
                        "updated_at" = NOW()
                    WHERE "id" = %s
                    """,
                    (text_content, material_id),
                )

                persist_knowledge_chunks(
                    cursor,
                    material_id=material_id,
                    course_id=course_id,
                    lesson_id=lesson_id,
                    title=title,
                    text=text_content,
                )
            conn.commit()

        return True
    except Exception as error:
        with db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE "lesson_materials"
                    SET "processing_status" = 'failed',
                        "processing_error" = %s,
                        "updated_at" = NOW()
                    WHERE "id" = %s
                    """,
                    (str(error)[:2000], material_id),
                )
            conn.commit()
        raise
    finally:
        if local_path and os.path.exists(local_path):
            os.remove(local_path)

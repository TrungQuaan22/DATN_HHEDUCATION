from __future__ import annotations

import hashlib
import uuid

from langchain_text_splitters import RecursiveCharacterTextSplitter

from ai_client import embed_document
from config import (
    CHUNK_OVERLAP,
    CHUNK_SIZE,
    EMBEDDING_DIMENSIONS,
    EMBEDDING_MODEL,
    EMBEDDING_PROVIDER,
)


def split_text(text: str) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    return [chunk.strip() for chunk in splitter.split_text(text) if chunk.strip()]


def build_embedded_chunks(text: str, title: str | None = None) -> list[tuple[int, str, list[float]]]:
    chunks = split_text(text)
    if not chunks:
        raise ValueError("No chunks were produced from the lesson material")

    embedded_chunks: list[tuple[int, str, list[float]]] = []
    for index, chunk_text in enumerate(chunks):
        vector = embed_document(chunk_text, title=title)
        if len(vector) != EMBEDDING_DIMENSIONS:
            raise ValueError(
                f"Embedding dimension mismatch: expected {EMBEDDING_DIMENSIONS}, got {len(vector)}"
            )
        embedded_chunks.append((index, chunk_text, vector))

    return embedded_chunks


def persist_knowledge_chunks(
    cursor,
    *,
    material_id: str,
    course_id: str,
    lesson_id: str | None,
    title: str | None,
    text: str,
) -> int:
    embedded_chunks = build_embedded_chunks(text, title=title)

    cursor.execute('DELETE FROM "knowledge_chunks" WHERE "material_id" = %s', (material_id,))

    for index, chunk_text, vector in embedded_chunks:
        content_hash = hashlib.sha256(chunk_text.encode("utf-8")).hexdigest()
        cursor.execute(
            """
            INSERT INTO "knowledge_chunks"
            (
              "id", "course_id", "lesson_id", "material_id", "source_type",
              "chunk_index", "content", "content_hash", "embedding_provider",
              "embedding_model", "embedding_dimensions", "embedding_vector",
              "indexed_at", "created_at"
            )
            VALUES (%s, %s, %s, %s, 'material', %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """,
            (
                str(uuid.uuid4()),
                course_id,
                lesson_id,
                material_id,
                index,
                chunk_text,
                content_hash,
                EMBEDDING_PROVIDER,
                EMBEDDING_MODEL,
                EMBEDDING_DIMENSIONS,
                vector,
            ),
        )

    return len(embedded_chunks)

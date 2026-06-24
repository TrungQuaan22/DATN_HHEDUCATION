from __future__ import annotations

import hashlib
import os
import tempfile
import uuid

import requests
from langchain_text_splitters import RecursiveCharacterTextSplitter

from ai_client import embed_document
from config import (
    CHUNK_OVERLAP,
    CHUNK_SIZE,
    EMBEDDING_DIMENSIONS,
    EMBEDDING_MODEL,
    EMBEDDING_PROVIDER,
)
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


def split_text(text: str) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    return [chunk.strip() for chunk in splitter.split_text(text) if chunk.strip()]


def run_ingestion(
    material_id: str,
    media_id: str | None,
    course_id: str,
    lesson_id: str,
    material_type: str,
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

        chunks = split_text(text_content)
        if not chunks:
            raise ValueError("No chunks were produced from the lesson material")

        embedded_chunks = []
        for chunk_text in chunks:
            vector = embed_document(chunk_text, title=None)
            if len(vector) != EMBEDDING_DIMENSIONS:
                raise ValueError(
                    f"Embedding dimension mismatch: expected {EMBEDDING_DIMENSIONS}, got {len(vector)}"
                )
            embedded_chunks.append((chunk_text, vector))

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

                cursor.execute(
                    'DELETE FROM "knowledge_chunks" WHERE "material_id" = %s',
                    (material_id,),
                )

                for index, (chunk_text, vector) in enumerate(embedded_chunks):
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

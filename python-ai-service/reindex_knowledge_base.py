from __future__ import annotations

import argparse

from database import db_connection
from knowledge_indexer import persist_knowledge_chunks


def get_reindexable_materials(conn):
    with conn.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                "id",
                "course_id",
                "lesson_id",
                "title",
                COALESCE(NULLIF(BTRIM("extracted_text"), ''), NULLIF(BTRIM("content_text"), '')) AS source_text
            FROM "lesson_materials"
            WHERE "deleted_at" IS NULL
            ORDER BY "created_at" ASC
            """
        )
        rows = cursor.fetchall()

    return rows


def reindex_knowledge_base(dry_run: bool = False) -> dict[str, int]:
    inserted_chunks = 0
    skipped_materials = 0

    with db_connection() as conn:
        with conn.cursor() as cursor:
            if not dry_run:
                cursor.execute('DELETE FROM "knowledge_chunks"')
                conn.commit()

        materials = get_reindexable_materials(conn)

        for material_id, course_id, lesson_id, title, source_text in materials:
            if not source_text:
                skipped_materials += 1
                continue

            if dry_run:
                continue

            with conn.cursor() as cursor:
                inserted_chunks += persist_knowledge_chunks(
                    cursor,
                    material_id=str(material_id),
                    course_id=str(course_id),
                    lesson_id=lesson_id,
                    title=title,
                    text=source_text,
                )
                conn.commit()

    return {
        "inserted_chunks": inserted_chunks,
        "skipped_materials": skipped_materials,
        "dry_run": int(dry_run),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Rebuild all knowledge chunks with the current embedding model.")
    parser.add_argument("--dry-run", action="store_true", help="List materials without deleting or inserting vectors.")
    args = parser.parse_args()

    result = reindex_knowledge_base(dry_run=args.dry_run)
    print(
        "Reindex completed: "
        f"inserted_chunks={result['inserted_chunks']}, "
        f"skipped_materials={result['skipped_materials']}, "
        f"dry_run={bool(result['dry_run'])}"
    )


if __name__ == "__main__":
    main()

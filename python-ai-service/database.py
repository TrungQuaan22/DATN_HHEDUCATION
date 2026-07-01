from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

import psycopg2
from pgvector.psycopg2 import register_vector

from config import DATABASE_URL


@contextmanager
def db_connection() -> Iterator[psycopg2.extensions.connection]:
    conn = psycopg2.connect(DATABASE_URL)
    register_vector(conn)
    try:
        yield conn
    finally:
        conn.close()

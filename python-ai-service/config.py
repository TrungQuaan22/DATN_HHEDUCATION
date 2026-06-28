from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()
load_dotenv(Path(__file__).resolve().parents[1] / "backend" / ".env", override=False)


def required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is required")
    return value


DATABASE_URL = required_env("DATABASE_URL")

AI_SERVICE_INTERNAL_TOKEN = os.getenv("AI_SERVICE_INTERNAL_TOKEN")

EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "openai-compatible")
EMBEDDING_API_BASE_URL = required_env("EMBEDDING_API_BASE_URL")
EMBEDDING_API_KEY = required_env("EMBEDDING_API_KEY")
EMBEDDING_MODEL = required_env("EMBEDDING_MODEL")
EMBEDDING_DIMENSIONS = int(os.getenv("EMBEDDING_DIMENSIONS", "1536"))

CHAT_PROVIDER = os.getenv("CHAT_PROVIDER", "openai-compatible")
CHAT_API_BASE_URL = required_env("CHAT_API_BASE_URL")
CHAT_API_KEY = required_env("CHAT_API_KEY")
CHAT_MODEL = required_env("CHAT_MODEL")
CHAT_TEMPERATURE = float(os.getenv("CHAT_TEMPERATURE", "0.2"))

CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "1000"))
CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "150"))
RETRIEVAL_LIMIT = int(os.getenv("RAG_RETRIEVAL_LIMIT", "6"))
SIMILARITY_THRESHOLD = float(os.getenv("RAG_SIMILARITY_THRESHOLD", "0.55"))
LESSON_BOOST = float(os.getenv("RAG_LESSON_BOOST", "0.05"))

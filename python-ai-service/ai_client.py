from __future__ import annotations

from typing import Generator

from openai import OpenAI

from config import (
    CHAT_MODEL,
    CHAT_API_BASE_URL,
    CHAT_API_KEY,
    CHAT_TEMPERATURE,
    EMBEDDING_API_BASE_URL,
    EMBEDDING_API_KEY,
    EMBEDDING_DIMENSIONS,
    EMBEDDING_MODEL,
)

embedding_client = OpenAI(api_key=EMBEDDING_API_KEY, base_url=EMBEDDING_API_BASE_URL)
chat_client = OpenAI(api_key=CHAT_API_KEY, base_url=CHAT_API_BASE_URL)


def format_document_for_retrieval(text: str, title: str | None) -> str:
    safe_title = title.strip() if title and title.strip() else "none"
    return f"title: {safe_title} | text: {text}"


def format_query_for_retrieval(question: str) -> str:
    return f"task: question answering | query: {question}"


def embed_document(text: str, title: str | None = None) -> list[float]:
    return embed_text(format_document_for_retrieval(text, title))


def embed_query(question: str) -> list[float]:
    return embed_text(format_query_for_retrieval(question))


def embed_text(text: str) -> list[float]:
    result = embedding_client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text,
        dimensions=EMBEDDING_DIMENSIONS,
    )
    if not result.data:
        raise RuntimeError("Embedding provider returned no embeddings")
    return list(result.data[0].embedding)


def generate_answer(messages: list[dict[str, str]]) -> str:
    response = chat_client.chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
        temperature=CHAT_TEMPERATURE,
    )
    content = response.choices[0].message.content if response.choices else None
    if not content:
        raise RuntimeError("Chat provider returned an empty answer")
    return content


def generate_answer_stream(messages: list[dict[str, str]]) -> Generator[str, None, None]:
    response_stream = chat_client.chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
        temperature=CHAT_TEMPERATURE,
        stream=True,
    )
    for chunk in response_stream:
        delta = chunk.choices[0].delta.content if chunk.choices else None
        if delta:
            yield delta

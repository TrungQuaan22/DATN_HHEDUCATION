from __future__ import annotations

from typing import Generator

from google import genai
from google.genai import types

from config import (
    CHAT_MODEL,
    EMBEDDING_DIMENSIONS,
    EMBEDDING_MODEL,
    GOOGLE_API_KEY,
)

client = genai.Client(api_key=GOOGLE_API_KEY)


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
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(output_dimensionality=EMBEDDING_DIMENSIONS),
    )
    if not result.embeddings:
        raise RuntimeError("Embedding provider returned no embeddings")
    return list(result.embeddings[0].values)


def generate_answer(messages: list[dict[str, str]]) -> str:
    contents: list[types.Content] = []
    system_instruction = ""

    for message in messages:
        role = message["role"]
        content = message["content"]
        if role == "system":
            system_instruction = content
            continue

        gemini_role = "model" if role == "assistant" else "user"
        contents.append(
            types.Content(
                role=gemini_role,
                parts=[types.Part.from_text(text=content)],
            )
        )

    result = client.models.generate_content(
        model=CHAT_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            temperature=0.2,
            system_instruction=system_instruction or None,
        ),
    )
    if not result.text:
        raise RuntimeError("Chat provider returned an empty answer")
    return result.text


def generate_answer_stream(messages: list[dict[str, str]]) -> Generator[str, None, None]:
    contents: list[types.Content] = []
    system_instruction = ""

    for message in messages:
        role = message["role"]
        content = message["content"]
        if role == "system":
            system_instruction = content
            continue

        gemini_role = "model" if role == "assistant" else "user"
        contents.append(
            types.Content(
                role=gemini_role,
                parts=[types.Part.from_text(text=content)],
            )
        )

    response_stream = client.models.generate_content_stream(
        model=CHAT_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            temperature=0.2,
            system_instruction=system_instruction or None,
        ),
    )
    for chunk in response_stream:
        if chunk.text:
            yield chunk.text

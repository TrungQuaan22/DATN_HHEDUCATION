# Force reload to pick up new CHAT_MODEL
from __future__ import annotations

from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from config import AI_SERVICE_INTERNAL_TOKEN
from ingest_service import run_ingestion
from rag_service import run_rag_tutor, run_rag_tutor_stream

app = FastAPI(title="HH Education AI Tutor RAG Service", version="1.0.0")


def verify_internal_token(x_ai_service_token: str | None = Header(default=None)) -> None:
    if AI_SERVICE_INTERNAL_TOKEN and x_ai_service_token != AI_SERVICE_INTERNAL_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid AI service token")


class IngestRequest(BaseModel):
    material_id: str
    media_id: Optional[str] = None
    course_id: str
    lesson_id: str
    type: str
    title: Optional[str] = None
    file_url: Optional[str] = None
    content_text: Optional[str] = None


class ChatHistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    course_id: str
    lesson_id: Optional[str] = None
    question: str = Field(min_length=1)
    chat_history: list[ChatHistoryMessage] = Field(default_factory=list)


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/api/v1/ingest", dependencies=[Depends(verify_internal_token)])
def ingest_material(request: IngestRequest) -> dict:
    try:
        run_ingestion(
            material_id=request.material_id,
            media_id=request.media_id,
            course_id=request.course_id,
            lesson_id=request.lesson_id,
            material_type=request.type,
            title=request.title,
            file_url=request.file_url,
            content_text=request.content_text,
        )
        return {"success": True}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error


@app.post("/api/v1/tutor/chat", dependencies=[Depends(verify_internal_token)])
def tutor_chat(request: ChatRequest) -> dict:
    try:
        return run_rag_tutor(
            course_id=request.course_id,
            lesson_id=request.lesson_id,
            question=request.question,
            chat_history=[message.model_dump() for message in request.chat_history],
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error


@app.post("/api/v1/tutor/chat/stream", dependencies=[Depends(verify_internal_token)])
def tutor_chat_stream(request: ChatRequest) -> StreamingResponse:
    try:
        generator = run_rag_tutor_stream(
            course_id=request.course_id,
            lesson_id=request.lesson_id,
            question=request.question,
            chat_history=[message.model_dump() for message in request.chat_history],
        )
        return StreamingResponse(generator, media_type="text/event-stream")
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

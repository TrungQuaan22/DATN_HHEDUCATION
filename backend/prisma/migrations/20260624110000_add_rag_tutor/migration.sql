CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE "ChunkSourceType" AS ENUM ('lesson_description', 'material');

CREATE TYPE "ChatRole" AS ENUM ('user', 'assistant');

CREATE TABLE "knowledge_chunks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "course_id" UUID NOT NULL,
    "lesson_id" UUID,
    "material_id" UUID,
    "source_type" "ChunkSourceType" NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "content_hash" VARCHAR(128) NOT NULL,
    "token_count" INTEGER,
    "page_number" INTEGER,
    "start_time_sec" INTEGER,
    "end_time_sec" INTEGER,
    "embedding_provider" VARCHAR(50),
    "embedding_model" VARCHAR(100),
    "embedding_dimensions" INTEGER,
    "embedding_vector" vector(1536),
    "indexed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tutor_chat_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "lesson_id" UUID,
    "title" VARCHAR(255),
    "summary" TEXT,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "tutor_chat_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tutor_chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "token_count" INTEGER,
    "provider" VARCHAR(50),
    "model_name" VARCHAR(100),
    "latency_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tutor_chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tutor_chat_citations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "message_id" UUID NOT NULL,
    "chunk_id" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" DECIMAL(8,5),
    "quote" TEXT,
    "source_title" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tutor_chat_citations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "knowledge_chunks_course_id_idx" ON "knowledge_chunks"("course_id");
CREATE INDEX "knowledge_chunks_lesson_id_idx" ON "knowledge_chunks"("lesson_id");
CREATE INDEX "knowledge_chunks_material_id_idx" ON "knowledge_chunks"("material_id");
CREATE INDEX "knowledge_chunks_source_type_lesson_id_idx" ON "knowledge_chunks"("source_type", "lesson_id");
CREATE INDEX "knowledge_chunks_embedding_hnsw_idx" ON "knowledge_chunks" USING hnsw ("embedding_vector" vector_cosine_ops);

CREATE INDEX "tutor_chat_sessions_student_id_updated_at_idx" ON "tutor_chat_sessions"("student_id", "updated_at");
CREATE INDEX "tutor_chat_sessions_course_id_idx" ON "tutor_chat_sessions"("course_id");
CREATE INDEX "tutor_chat_sessions_lesson_id_idx" ON "tutor_chat_sessions"("lesson_id");

CREATE INDEX "tutor_chat_messages_session_id_created_at_idx" ON "tutor_chat_messages"("session_id", "created_at");

CREATE UNIQUE INDEX "tutor_chat_citations_message_id_chunk_id_key" ON "tutor_chat_citations"("message_id", "chunk_id");
CREATE INDEX "tutor_chat_citations_chunk_id_idx" ON "tutor_chat_citations"("chunk_id");

ALTER TABLE "knowledge_chunks"
ADD CONSTRAINT "knowledge_chunks_course_id_fkey"
FOREIGN KEY ("course_id") REFERENCES "courses"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "knowledge_chunks"
ADD CONSTRAINT "knowledge_chunks_lesson_id_fkey"
FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "knowledge_chunks"
ADD CONSTRAINT "knowledge_chunks_material_id_fkey"
FOREIGN KEY ("material_id") REFERENCES "lesson_materials"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tutor_chat_sessions"
ADD CONSTRAINT "tutor_chat_sessions_student_id_fkey"
FOREIGN KEY ("student_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tutor_chat_sessions"
ADD CONSTRAINT "tutor_chat_sessions_course_id_fkey"
FOREIGN KEY ("course_id") REFERENCES "courses"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tutor_chat_sessions"
ADD CONSTRAINT "tutor_chat_sessions_lesson_id_fkey"
FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tutor_chat_messages"
ADD CONSTRAINT "tutor_chat_messages_session_id_fkey"
FOREIGN KEY ("session_id") REFERENCES "tutor_chat_sessions"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tutor_chat_citations"
ADD CONSTRAINT "tutor_chat_citations_message_id_fkey"
FOREIGN KEY ("message_id") REFERENCES "tutor_chat_messages"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tutor_chat_citations"
ADD CONSTRAINT "tutor_chat_citations_chunk_id_fkey"
FOREIGN KEY ("chunk_id") REFERENCES "knowledge_chunks"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

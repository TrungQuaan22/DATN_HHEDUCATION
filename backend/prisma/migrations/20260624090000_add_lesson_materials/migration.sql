CREATE TYPE "LessonMaterialType" AS ENUM ('text', 'markdown', 'pdf', 'docx', 'pptx');

CREATE TYPE "LessonMaterialProcessingStatus" AS ENUM ('pending', 'processing', 'ready', 'failed');

CREATE TABLE "lesson_materials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "course_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "media_id" UUID,
    "created_by_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "type" "LessonMaterialType" NOT NULL,
    "object_key" VARCHAR(500),
    "content_text" TEXT,
    "extracted_text" TEXT,
    "processing_status" "LessonMaterialProcessingStatus" NOT NULL DEFAULT 'pending',
    "processing_error" TEXT,
    "content_hash" VARCHAR(64),
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "lesson_materials_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lesson_materials_course_id_idx" ON "lesson_materials"("course_id");
CREATE INDEX "lesson_materials_lesson_id_is_public_deleted_at_idx" ON "lesson_materials"("lesson_id", "is_public", "deleted_at");
CREATE INDEX "lesson_materials_course_id_lesson_id_idx" ON "lesson_materials"("course_id", "lesson_id");
CREATE INDEX "lesson_materials_media_id_idx" ON "lesson_materials"("media_id");
CREATE INDEX "lesson_materials_created_by_id_idx" ON "lesson_materials"("created_by_id");
CREATE INDEX "lesson_materials_processing_status_idx" ON "lesson_materials"("processing_status");

ALTER TABLE "lesson_materials"
ADD CONSTRAINT "lesson_materials_course_id_fkey"
FOREIGN KEY ("course_id") REFERENCES "courses"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lesson_materials"
ADD CONSTRAINT "lesson_materials_lesson_id_fkey"
FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lesson_materials"
ADD CONSTRAINT "lesson_materials_media_id_fkey"
FOREIGN KEY ("media_id") REFERENCES "media"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "lesson_materials"
ADD CONSTRAINT "lesson_materials_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

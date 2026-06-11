-- Enums
ALTER TYPE "GradingType" ADD VALUE IF NOT EXISTS 'mixed';
CREATE TYPE "AssessmentPlacementType" AS ENUM ('public_practice', 'course', 'lesson');
ALTER TYPE "MediaType" ADD VALUE IF NOT EXISTS 'document';
ALTER TYPE "QuestionType" ADD VALUE IF NOT EXISTS 'essay';
CREATE TYPE "QuestionSource" AS ENUM ('bank', 'generated_exam', 'imported');

-- Assessment source and placement model
ALTER TABLE "assessments"
  ADD COLUMN "source_media_id" UUID,
  ADD COLUMN "source_metadata" JSONB;

CREATE TABLE "assessment_placements" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "assessment_id" UUID NOT NULL,
  "type" "AssessmentPlacementType" NOT NULL,
  "course_id" UUID,
  "lesson_id" UUID,
  "open_time" TIMESTAMP(3),
  "close_time" TIMESTAMP(3),
  "max_attempts" INTEGER,
  "slug" VARCHAR(255),
  "is_featured" BOOLEAN NOT NULL DEFAULT false,
  "order_index" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "assessment_placements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "assessment_placements_slug_key" ON "assessment_placements"("slug");
CREATE INDEX "assessment_placements_assessment_id_idx" ON "assessment_placements"("assessment_id");
CREATE INDEX "assessment_placements_type_idx" ON "assessment_placements"("type");
CREATE INDEX "assessment_placements_course_id_idx" ON "assessment_placements"("course_id");
CREATE INDEX "assessment_placements_lesson_id_idx" ON "assessment_placements"("lesson_id");
CREATE INDEX "assessments_source_media_id_idx" ON "assessments"("source_media_id");

ALTER TABLE "assessments"
  ADD CONSTRAINT "assessments_source_media_id_fkey"
  FOREIGN KEY ("source_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "assessment_placements"
  ADD CONSTRAINT "assessment_placements_assessment_id_fkey"
  FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assessment_placements"
  ADD CONSTRAINT "assessment_placements_course_id_fkey"
  FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "assessment_placements"
  ADD CONSTRAINT "assessment_placements_lesson_id_fkey"
  FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill legacy course/lesson assessment links as placement contexts.
INSERT INTO "assessment_placements" (
  "assessment_id",
  "type",
  "course_id",
  "lesson_id",
  "created_at",
  "updated_at"
)
SELECT
  "assessment_id",
  'course'::"AssessmentPlacementType",
  "course_id",
  NULL,
  "created_at",
  "updated_at"
FROM "course_assessments";

INSERT INTO "assessment_placements" (
  "assessment_id",
  "type",
  "course_id",
  "lesson_id",
  "created_at",
  "updated_at"
)
SELECT
  "assessment_id",
  'lesson'::"AssessmentPlacementType",
  NULL,
  "lesson_id",
  "created_at",
  "updated_at"
FROM "lesson_assessments";

-- Placement-aware submissions and split auto/manual score.
ALTER TABLE "submissions"
  ADD COLUMN "placement_id" UUID,
  ADD COLUMN "auto_score" DECIMAL(8,2);

CREATE INDEX "submissions_placement_id_idx" ON "submissions"("placement_id");
CREATE UNIQUE INDEX "submissions_placement_id_student_id_attempt_number_key"
  ON "submissions"("placement_id", "student_id", "attempt_number");

ALTER TABLE "submissions"
  ADD CONSTRAINT "submissions_placement_id_fkey"
  FOREIGN KEY ("placement_id") REFERENCES "assessment_placements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Generated exam questions stay out of the default question bank.
ALTER TABLE "questions"
  ADD COLUMN "source" "QuestionSource" NOT NULL DEFAULT 'bank',
  ADD COLUMN "source_ref" JSONB;

CREATE INDEX "questions_source_idx" ON "questions"("source");

-- MCQ multiple-answer support. Preserve old selected_option_id data in a join table.
CREATE TABLE "submission_mcq_selected_options" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "answer_id" UUID NOT NULL,
  "option_id" UUID NOT NULL,
  CONSTRAINT "submission_mcq_selected_options_pkey" PRIMARY KEY ("id")
);

INSERT INTO "submission_mcq_selected_options" ("answer_id", "option_id")
SELECT "id", "selected_option_id"
FROM "submission_mcq_answers"
WHERE "selected_option_id" IS NOT NULL;

CREATE UNIQUE INDEX "submission_mcq_selected_options_answer_id_option_id_key"
  ON "submission_mcq_selected_options"("answer_id", "option_id");
CREATE INDEX "submission_mcq_selected_options_answer_id_idx"
  ON "submission_mcq_selected_options"("answer_id");
CREATE INDEX "submission_mcq_selected_options_option_id_idx"
  ON "submission_mcq_selected_options"("option_id");

ALTER TABLE "submission_mcq_selected_options"
  ADD CONSTRAINT "submission_mcq_selected_options_answer_id_fkey"
  FOREIGN KEY ("answer_id") REFERENCES "submission_mcq_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "submission_mcq_selected_options"
  ADD CONSTRAINT "submission_mcq_selected_options_option_id_fkey"
  FOREIGN KEY ("option_id") REFERENCES "question_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "submission_mcq_answers"
  DROP CONSTRAINT "submission_mcq_answers_selected_option_id_fkey",
  DROP COLUMN "selected_option_id";

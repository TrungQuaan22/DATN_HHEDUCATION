CREATE TABLE "assessment_sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assessment_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "item_type" "AssessmentItemType" NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_sections_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "assessment_sections"
ADD CONSTRAINT "assessment_sections_assessment_id_fkey"
FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "assessment_sections_assessment_id_order_index_key"
ON "assessment_sections"("assessment_id", "order_index");

CREATE INDEX "assessment_sections_assessment_id_idx"
ON "assessment_sections"("assessment_id");

ALTER TABLE "assessment_items"
DROP CONSTRAINT IF EXISTS "assessment_items_assessment_id_question_number_key";

ALTER TABLE "assessment_items"
DROP COLUMN IF EXISTS "question_number",
ADD COLUMN "section_id" UUID NOT NULL,
ADD COLUMN "order_index" INTEGER NOT NULL;

ALTER TABLE "assessment_items"
ADD CONSTRAINT "assessment_items_section_id_fkey"
FOREIGN KEY ("section_id") REFERENCES "assessment_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "assessment_items_section_id_order_index_key"
ON "assessment_items"("section_id", "order_index");

CREATE INDEX "assessment_items_section_id_idx"
ON "assessment_items"("section_id");

ALTER TABLE "assessments"
DROP COLUMN IF EXISTS "open_time",
DROP COLUMN IF EXISTS "close_time",
DROP COLUMN IF EXISTS "max_attempts";

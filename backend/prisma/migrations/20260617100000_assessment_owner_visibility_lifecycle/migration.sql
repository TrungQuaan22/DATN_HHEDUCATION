ALTER TABLE "assessments"
ADD COLUMN "created_by_id" UUID,
ADD COLUMN "published_at" TIMESTAMP(3),
ADD COLUMN "hidden_at" TIMESTAMP(3);

ALTER TABLE "assessments"
ADD CONSTRAINT "assessments_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "assessments_created_by_id_idx" ON "assessments"("created_by_id");

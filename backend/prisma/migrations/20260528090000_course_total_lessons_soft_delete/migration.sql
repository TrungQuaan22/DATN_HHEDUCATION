-- Add course-level lesson aggregate for lightweight list/overview APIs.
ALTER TABLE "courses" ADD COLUMN "total_lessons" INTEGER NOT NULL DEFAULT 0;

-- Soft delete course structure records to preserve progress/history consistency.
ALTER TABLE "chapters" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "lessons" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Backfill total lessons from the existing normalized Course -> Chapter -> Lesson structure.
UPDATE "courses" AS c
SET "total_lessons" = COALESCE(sub."lesson_count", 0)
FROM (
  SELECT ch."course_id", COUNT(l."id")::int AS "lesson_count"
  FROM "chapters" AS ch
  LEFT JOIN "lessons" AS l ON l."chapter_id" = ch."id" AND l."deleted_at" IS NULL
  WHERE ch."deleted_at" IS NULL
  GROUP BY ch."course_id"
) AS sub
WHERE c."id" = sub."course_id";

-- total_lessons belongs to courses, not user-course progress.
ALTER TABLE "course_progress" DROP COLUMN "total_lessons";

CREATE INDEX "chapters_course_id_deleted_at_idx" ON "chapters"("course_id", "deleted_at");
CREATE INDEX "lessons_chapter_id_deleted_at_idx" ON "lessons"("chapter_id", "deleted_at");
CREATE INDEX "lessons_deleted_at_idx" ON "lessons"("deleted_at");

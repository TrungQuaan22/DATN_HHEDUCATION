-- Align database-level rules with Rules_Skills/DB final Version 14_5.md.
-- Prisma schema cannot represent PostgreSQL partial indexes or CHECK constraints,
-- so those rules live in this manual migration.

-- Replace broad indexes with partial indexes for active, non-deleted records.
DROP INDEX IF EXISTS "user_sessions_user_id_expires_at_idx";
DROP INDEX IF EXISTS "courses_slug_key";
DROP INDEX IF EXISTS "courses_status_idx";
DROP INDEX IF EXISTS "assessments_course_id_visibility_idx";
DROP INDEX IF EXISTS "blog_posts_status_idx";

CREATE INDEX "idx_user_sessions_active"
  ON "user_sessions"("user_id", "expires_at")
  WHERE "is_revoked" = false;

CREATE UNIQUE INDEX "idx_courses_slug_active"
  ON "courses"("slug")
  WHERE "deleted_at" IS NULL;

CREATE INDEX "idx_courses_status"
  ON "courses"("status")
  WHERE "deleted_at" IS NULL;

CREATE INDEX "idx_assessments_course_visibility"
  ON "assessments"("course_id", "visibility")
  WHERE "deleted_at" IS NULL;

CREATE INDEX "idx_blog_posts_status"
  ON "blog_posts"("status")
  WHERE "deleted_at" IS NULL;

CREATE UNIQUE INDEX "idx_payments_one_success_per_order"
  ON "payments"("order_id")
  WHERE "status" = 'success';

ALTER TABLE "payments"
  ALTER COLUMN "transaction_ref" DROP NOT NULL;

-- Course and learning content rules.
ALTER TABLE "lessons"
  ADD CONSTRAINT "chk_lessons_duration_non_negative"
  CHECK ("duration_sec" IS NULL OR "duration_sec" >= 0) NOT VALID;

ALTER TABLE "lessons"
  ADD CONSTRAINT "chk_lessons_type_video_url"
  CHECK (
    ("type" = 'video' AND "video_url" IS NOT NULL)
    OR ("type" = 'quiz' AND "video_url" IS NULL)
  ) NOT VALID;

ALTER TABLE "enrollments"
  ADD CONSTRAINT "chk_enrollments_payment_requires_order"
  CHECK ("source" <> 'payment' OR "order_id" IS NOT NULL) NOT VALID;

-- Assessment and submission rules.
ALTER TABLE "assessments"
  ADD CONSTRAINT "chk_assessments_max_attempts_positive"
  CHECK ("max_attempts" >= 1) NOT VALID;

ALTER TABLE "assessments"
  ADD CONSTRAINT "chk_assessments_time_limit_positive"
  CHECK ("time_limit_minutes" IS NULL OR "time_limit_minutes" > 0) NOT VALID;

ALTER TABLE "assessments"
  ADD CONSTRAINT "chk_assessments_close_after_open"
  CHECK ("close_time" IS NULL OR "open_time" IS NULL OR "close_time" > "open_time") NOT VALID;

ALTER TABLE "assessment_items"
  ADD CONSTRAINT "chk_assessment_items_mode"
  CHECK (
    ("question_id" IS NOT NULL AND "topic_id" IS NULL AND "difficulty" IS NULL)
    OR ("question_id" IS NULL AND "topic_id" IS NOT NULL AND "difficulty" IS NOT NULL)
  ) NOT VALID;

ALTER TABLE "submissions"
  ADD CONSTRAINT "chk_submissions_attempt_number_positive"
  CHECK ("attempt_number" > 0) NOT VALID;

ALTER TABLE "submissions"
  ADD CONSTRAINT "chk_submissions_submit_time_required"
  CHECK (
    "status" = 'doing'
    OR "submit_time" IS NOT NULL
  ) NOT VALID;

ALTER TABLE "student_topic_performance"
  ADD CONSTRAINT "chk_stp_total_attempts_non_negative"
  CHECK ("total_attempts" >= 0) NOT VALID;

ALTER TABLE "student_topic_performance"
  ADD CONSTRAINT "chk_stp_correct_attempts_non_negative"
  CHECK ("correct_attempts" >= 0) NOT VALID;

ALTER TABLE "student_topic_performance"
  ADD CONSTRAINT "chk_stp_correct_lte_total"
  CHECK ("correct_attempts" <= "total_attempts") NOT VALID;

ALTER TABLE "student_topic_performance"
  ADD CONSTRAINT "chk_stp_total_points_non_negative"
  CHECK ("total_points" >= 0) NOT VALID;

ALTER TABLE "student_topic_performance"
  ADD CONSTRAINT "chk_stp_max_points_non_negative"
  CHECK ("max_points" >= 0) NOT VALID;

-- Practice rules.
ALTER TABLE "practice_sessions"
  ADD CONSTRAINT "chk_practice_sessions_total_questions_positive"
  CHECK ("total_questions" > 0) NOT VALID;

ALTER TABLE "practice_sessions"
  ADD CONSTRAINT "chk_practice_sessions_score_non_negative"
  CHECK ("score" IS NULL OR "score" >= 0) NOT VALID;

-- Progress rules.
ALTER TABLE "lesson_progress"
  ADD CONSTRAINT "chk_lesson_progress_watched_non_negative"
  CHECK ("watched_seconds" >= 0) NOT VALID;

ALTER TABLE "lesson_progress"
  ADD CONSTRAINT "chk_lesson_progress_last_position_non_negative"
  CHECK ("last_position_sec" >= 0) NOT VALID;

ALTER TABLE "lesson_progress"
  ADD CONSTRAINT "chk_lesson_progress_duration_positive"
  CHECK ("duration_sec" > 0) NOT VALID;

ALTER TABLE "lesson_progress"
  ADD CONSTRAINT "chk_lesson_progress_watched_lte_duration"
  CHECK ("watched_seconds" <= "duration_sec") NOT VALID;

ALTER TABLE "course_progress"
  ADD CONSTRAINT "chk_course_progress_total_non_negative"
  CHECK ("total_lessons" >= 0) NOT VALID;

ALTER TABLE "course_progress"
  ADD CONSTRAINT "chk_course_progress_completed_non_negative"
  CHECK ("completed_lessons" >= 0) NOT VALID;

ALTER TABLE "course_progress"
  ADD CONSTRAINT "chk_course_progress_completed_lte_total"
  CHECK ("completed_lessons" <= "total_lessons") NOT VALID;

-- Payment rules.
ALTER TABLE "orders"
  ADD CONSTRAINT "chk_orders_total_amount_non_negative"
  CHECK ("total_amount" >= 0) NOT VALID;

ALTER TABLE "order_items"
  ADD CONSTRAINT "chk_order_items_price_non_negative"
  CHECK ("price_at_purchase" >= 0) NOT VALID;

ALTER TABLE "payments"
  ADD CONSTRAINT "chk_payments_amount_non_negative"
  CHECK ("amount" >= 0) NOT VALID;

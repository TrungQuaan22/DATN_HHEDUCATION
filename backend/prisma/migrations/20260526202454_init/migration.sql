-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('quiz', 'exam');

-- CreateEnum
CREATE TYPE "GradingType" AS ENUM ('auto', 'manual');

-- CreateEnum
CREATE TYPE "AssessmentVisibility" AS ENUM ('draft', 'published', 'hidden');

-- CreateEnum
CREATE TYPE "AssessmentItemType" AS ENUM ('mcq', 'true_false', 'numeric', 'essay');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('doing', 'submitted', 'auto_submitted', 'completed');

-- CreateEnum
CREATE TYPE "AiStatus" AS ENUM ('none', 'processing', 'summarized', 'unsupported', 'failed');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'teacher', 'student');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending_verification', 'active', 'banned');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('video', 'quiz', 'document');

-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('system', 'youtube');

-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('math', 'physics', 'chemistry', 'literature', 'english', 'biology', 'history', 'geography');

-- CreateEnum
CREATE TYPE "EnrollmentSource" AS ENUM ('payment', 'manual');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('pending_upload', 'uploaded', 'processing', 'ready', 'failed', 'deleted');

-- CreateEnum
CREATE TYPE "MediaVisibility" AS ENUM ('private', 'public');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'completed', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'success', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('received', 'processing', 'processed', 'failed');

-- CreateEnum
CREATE TYPE "PracticeSessionStatus" AS ENUM ('doing', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('recognition', 'understanding', 'application', 'advanced');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('mcq', 'true_false', 'numeric');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('active', 'hidden', 'archived');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('new_lesson', 'graded', 'new_assignment', 'upcoming_assessment');

-- CreateTable
CREATE TABLE "assessments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subject" "Subject" NOT NULL,
    "grade" INTEGER NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "title" TEXT NOT NULL,
    "grading_type" "GradingType" NOT NULL,
    "time_limit_minutes" INTEGER,
    "visibility" "AssessmentVisibility" NOT NULL DEFAULT 'draft',
    "open_time" TIMESTAMP(3),
    "close_time" TIMESTAMP(3),
    "max_attempts" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_assessments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "course_id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_assessments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lesson_id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assessment_id" UUID NOT NULL,
    "item_type" "AssessmentItemType" NOT NULL,
    "question_id" UUID,
    "topic_id" UUID,
    "difficulty" "QuestionDifficulty",
    "question_number" INTEGER NOT NULL,
    "correct_answer" JSONB,
    "explanation" JSONB,
    "scoring_config" JSONB,
    "max_score" DECIMAL(8,2) NOT NULL DEFAULT 1,

    CONSTRAINT "assessment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assessment_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submit_time" TIMESTAMP(3),
    "status" "SubmissionStatus" NOT NULL DEFAULT 'doing',
    "version" INTEGER NOT NULL DEFAULT 0,
    "final_score" DECIMAL(8,2),
    "violation_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_mcq_answers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "submission_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "selected_option_id" UUID NOT NULL,
    "is_correct" BOOLEAN,
    "point_earned" DECIMAL(8,2) NOT NULL DEFAULT 0,

    CONSTRAINT "submission_mcq_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_tf_answers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "submission_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "option_id" UUID NOT NULL,
    "selected_value" BOOLEAN NOT NULL,
    "is_correct" BOOLEAN,
    "point_earned" DECIMAL(8,2) NOT NULL DEFAULT 0,

    CONSTRAINT "submission_tf_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_numeric_answers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "submission_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "answer_value" DECIMAL(18,6) NOT NULL,
    "is_correct" BOOLEAN,
    "point_earned" DECIMAL(8,2) NOT NULL DEFAULT 0,

    CONSTRAINT "submission_numeric_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_essay_answers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "submission_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "answer" TEXT NOT NULL,
    "ai_summary" TEXT,
    "ai_status" "AiStatus" NOT NULL DEFAULT 'none',
    "teacher_score" DECIMAL(8,2),
    "teacher_note" TEXT,
    "graded_by" UUID,
    "graded_at" TIMESTAMP(3),

    CONSTRAINT "submission_essay_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "avatar_media_id" UUID,
    "avatar_object_key" VARCHAR(500),
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'pending_verification',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "previous_refresh_token_hash" TEXT,
    "previous_token_rotated_at" TIMESTAMP(3),
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "revoked_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "excerpt" VARCHAR(500),
    "category" VARCHAR(100),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "content" JSONB NOT NULL,
    "author_id" UUID NOT NULL,
    "thumbnail_media_id" UUID,
    "thumbnail_object_key" VARCHAR(500),
    "status" "BlogPostStatus" NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "subject" "Subject" NOT NULL,
    "grade" INTEGER NOT NULL,
    "teacher_id" UUID NOT NULL,
    "thumbnail_media_id" UUID,
    "thumbnail_object_key" VARCHAR(500),
    "price" INTEGER NOT NULL DEFAULT 0,
    "sale_price" INTEGER,
    "status" "CourseStatus" NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "course_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chapter_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" "LessonType" NOT NULL,
    "description" TEXT,
    "video_type" "VideoType",
    "video_media_id" UUID,
    "youtube_url" TEXT,
    "duration_sec" INTEGER,
    "allow_preview" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "order_id" UUID,
    "source" "EnrollmentSource" NOT NULL DEFAULT 'payment',
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "MediaType" NOT NULL,
    "status" "MediaStatus" NOT NULL,
    "visibility" "MediaVisibility" NOT NULL DEFAULT 'private',
    "original_name" VARCHAR(255),
    "object_key" VARCHAR(500) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "etag" VARCHAR(255),
    "width" INTEGER,
    "height" INTEGER,
    "duration_sec" INTEGER,
    "uploaded_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "idempotency_key" VARCHAR(255) NOT NULL,
    "order_invoice_number" VARCHAR(50) NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'VND',
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "price_at_purchase" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'VND',
    "raw_payload" JSONB,
    "transaction_ref" VARCHAR(255),
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" VARCHAR(50) NOT NULL,
    "event_id" VARCHAR(255) NOT NULL,
    "status" "WebhookStatus" NOT NULL DEFAULT 'received',
    "payload" JSONB NOT NULL,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "next_retry_at" TIMESTAMP(3),
    "error_message" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "target_topic_id" UUID,
    "target_difficulty" "QuestionDifficulty",
    "total_questions" INTEGER NOT NULL DEFAULT 10,
    "score" DECIMAL(8,2),
    "status" "PracticeSessionStatus" NOT NULL DEFAULT 'doing',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "practice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_answers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "selected_answer" JSONB NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "point_earned" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practice_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "watched_seconds" INTEGER NOT NULL DEFAULT 0,
    "last_position_sec" INTEGER NOT NULL DEFAULT 0,
    "duration_sec" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_progress" (
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "total_lessons" INTEGER NOT NULL,
    "completed_lessons" INTEGER NOT NULL DEFAULT 0,
    "last_learned_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_progress_pkey" PRIMARY KEY ("user_id","course_id")
);

-- CreateTable
CREATE TABLE "student_topic_performance" (
    "student_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "difficulty" "QuestionDifficulty" NOT NULL,
    "total_attempts" INTEGER NOT NULL DEFAULT 0,
    "correct_attempts" INTEGER NOT NULL DEFAULT 0,
    "total_points" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "max_points" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMP(3),

    CONSTRAINT "student_topic_performance_pkey" PRIMARY KEY ("student_id","topic_id","difficulty")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "parent_id" UUID,
    "course_id" UUID NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "topic_id" UUID NOT NULL,
    "difficulty" "QuestionDifficulty" NOT NULL,
    "type" "QuestionType" NOT NULL,
    "content" JSONB NOT NULL,
    "explanation" JSONB,
    "status" "QuestionStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question_id" UUID NOT NULL,
    "content" JSONB NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" VARCHAR(255),
    "actor_id" UUID,
    "action" VARCHAR(255) NOT NULL,
    "resource_type" VARCHAR(100) NOT NULL,
    "resource_id" UUID NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "link_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_assessments_course_id_idx" ON "course_assessments"("course_id");

-- CreateIndex
CREATE INDEX "course_assessments_assessment_id_idx" ON "course_assessments"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_assessments_course_id_assessment_id_key" ON "course_assessments"("course_id", "assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_assessments_lesson_id_key" ON "lesson_assessments"("lesson_id");

-- CreateIndex
CREATE INDEX "lesson_assessments_assessment_id_idx" ON "lesson_assessments"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_items_assessment_id_idx" ON "assessment_items"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_items_question_id_idx" ON "assessment_items"("question_id");

-- CreateIndex
CREATE INDEX "assessment_items_topic_id_difficulty_idx" ON "assessment_items"("topic_id", "difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_items_assessment_id_question_number_key" ON "assessment_items"("assessment_id", "question_number");

-- CreateIndex
CREATE INDEX "submissions_student_id_idx" ON "submissions"("student_id");

-- CreateIndex
CREATE INDEX "submissions_assessment_id_idx" ON "submissions"("assessment_id");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE INDEX "submissions_assessment_id_status_idx" ON "submissions"("assessment_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_assessment_id_student_id_attempt_number_key" ON "submissions"("assessment_id", "student_id", "attempt_number");

-- CreateIndex
CREATE INDEX "submission_mcq_answers_submission_id_idx" ON "submission_mcq_answers"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "submission_mcq_answers_submission_id_item_id_key" ON "submission_mcq_answers"("submission_id", "item_id");

-- CreateIndex
CREATE INDEX "submission_tf_answers_submission_id_idx" ON "submission_tf_answers"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "submission_tf_answers_submission_id_item_id_option_id_key" ON "submission_tf_answers"("submission_id", "item_id", "option_id");

-- CreateIndex
CREATE INDEX "submission_numeric_answers_submission_id_idx" ON "submission_numeric_answers"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "submission_numeric_answers_submission_id_item_id_key" ON "submission_numeric_answers"("submission_id", "item_id");

-- CreateIndex
CREATE INDEX "submission_essay_answers_submission_id_idx" ON "submission_essay_answers"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "submission_essay_answers_submission_id_item_id_key" ON "submission_essay_answers"("submission_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_avatar_media_id_idx" ON "users"("avatar_media_id");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_author_id_idx" ON "blog_posts"("author_id");

-- CreateIndex
CREATE INDEX "blog_posts_thumbnail_media_id_idx" ON "blog_posts"("thumbnail_media_id");

-- CreateIndex
CREATE INDEX "courses_teacher_id_idx" ON "courses"("teacher_id");

-- CreateIndex
CREATE INDEX "chapters_course_id_idx" ON "chapters"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_course_id_order_index_key" ON "chapters"("course_id", "order_index");

-- CreateIndex
CREATE INDEX "lessons_chapter_id_idx" ON "lessons"("chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_chapter_id_order_index_key" ON "lessons"("chapter_id", "order_index");

-- CreateIndex
CREATE INDEX "enrollments_course_id_idx" ON "enrollments"("course_id");

-- CreateIndex
CREATE INDEX "enrollments_user_id_course_id_idx" ON "enrollments"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_user_id_course_id_key" ON "enrollments"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "media_type_idx" ON "media"("type");

-- CreateIndex
CREATE INDEX "media_status_idx" ON "media"("status");

-- CreateIndex
CREATE INDEX "media_uploaded_by_id_idx" ON "media"("uploaded_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_object_key_key" ON "media"("object_key");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_invoice_number_key" ON "orders"("order_invoice_number");

-- CreateIndex
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "orders_status_expires_at_idx" ON "orders"("status", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "orders_user_id_idempotency_key_key" ON "orders"("user_id", "idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_order_id_course_id_key" ON "order_items"("order_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_ref_key" ON "payments"("transaction_ref");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "webhook_events_status_next_retry_at_idx" ON "webhook_events"("status", "next_retry_at");

-- CreateIndex
CREATE INDEX "webhook_events_provider_created_at_idx" ON "webhook_events"("provider", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_provider_event_id_key" ON "webhook_events"("provider", "event_id");

-- CreateIndex
CREATE INDEX "practice_sessions_student_id_created_at_idx" ON "practice_sessions"("student_id", "created_at");

-- CreateIndex
CREATE INDEX "practice_sessions_course_id_idx" ON "practice_sessions"("course_id");

-- CreateIndex
CREATE INDEX "practice_answers_session_id_idx" ON "practice_answers"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "practice_answers_session_id_question_id_key" ON "practice_answers"("session_id", "question_id");

-- CreateIndex
CREATE INDEX "lesson_progress_user_id_idx" ON "lesson_progress"("user_id");

-- CreateIndex
CREATE INDEX "lesson_progress_lesson_id_is_completed_idx" ON "lesson_progress"("lesson_id", "is_completed");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_user_id_lesson_id_key" ON "lesson_progress"("user_id", "lesson_id");

-- CreateIndex
CREATE INDEX "course_progress_course_id_idx" ON "course_progress"("course_id");

-- CreateIndex
CREATE INDEX "student_topic_performance_student_id_idx" ON "student_topic_performance"("student_id");

-- CreateIndex
CREATE INDEX "student_topic_performance_topic_id_idx" ON "student_topic_performance"("topic_id");

-- CreateIndex
CREATE INDEX "topics_course_id_idx" ON "topics"("course_id");

-- CreateIndex
CREATE INDEX "topics_parent_id_idx" ON "topics"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "topics_course_id_parent_id_name_key" ON "topics"("course_id", "parent_id", "name");

-- CreateIndex
CREATE INDEX "questions_topic_id_difficulty_idx" ON "questions"("topic_id", "difficulty");

-- CreateIndex
CREATE INDEX "questions_topic_id_type_idx" ON "questions"("topic_id", "type");

-- CreateIndex
CREATE INDEX "question_options_question_id_idx" ON "question_options"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_options_question_id_order_index_key" ON "question_options"("question_id", "order_index");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_resource_type_resource_id_created_at_idx" ON "audit_logs"("resource_type", "resource_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- AddForeignKey
ALTER TABLE "course_assessments" ADD CONSTRAINT "course_assessments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_assessments" ADD CONSTRAINT "course_assessments_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_assessments" ADD CONSTRAINT "lesson_assessments_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_assessments" ADD CONSTRAINT "lesson_assessments_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_items" ADD CONSTRAINT "assessment_items_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_items" ADD CONSTRAINT "assessment_items_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_items" ADD CONSTRAINT "assessment_items_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_mcq_answers" ADD CONSTRAINT "submission_mcq_answers_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_mcq_answers" ADD CONSTRAINT "submission_mcq_answers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "assessment_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_mcq_answers" ADD CONSTRAINT "submission_mcq_answers_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "question_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_tf_answers" ADD CONSTRAINT "submission_tf_answers_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_tf_answers" ADD CONSTRAINT "submission_tf_answers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "assessment_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_tf_answers" ADD CONSTRAINT "submission_tf_answers_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "question_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_numeric_answers" ADD CONSTRAINT "submission_numeric_answers_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_numeric_answers" ADD CONSTRAINT "submission_numeric_answers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "assessment_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_essay_answers" ADD CONSTRAINT "submission_essay_answers_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_essay_answers" ADD CONSTRAINT "submission_essay_answers_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "assessment_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_essay_answers" ADD CONSTRAINT "submission_essay_answers_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_media_id_fkey" FOREIGN KEY ("avatar_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_thumbnail_media_id_fkey" FOREIGN KEY ("thumbnail_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_thumbnail_media_id_fkey" FOREIGN KEY ("thumbnail_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_video_media_id_fkey" FOREIGN KEY ("video_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_target_topic_id_fkey" FOREIGN KEY ("target_topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "practice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_topic_performance" ADD CONSTRAINT "student_topic_performance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_topic_performance" ADD CONSTRAINT "student_topic_performance_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

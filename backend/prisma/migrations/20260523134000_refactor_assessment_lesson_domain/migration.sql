-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('system', 'youtube');

-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('toan', 'vat_ly', 'hoa_hoc', 'ngu_van', 'tieng_anh', 'sinh_hoc', 'lich_su', 'dia_ly');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('lop_1', 'lop_2', 'lop_3', 'lop_4', 'lop_5', 'lop_6', 'lop_7', 'lop_8', 'lop_9', 'lop_10', 'lop_11', 'lop_12');

-- AlterEnum
ALTER TYPE "LessonType" ADD VALUE 'document';

-- DropForeignKey
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_course_id_fkey";

-- DropForeignKey
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_grade_id_fkey";

-- DropForeignKey
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_grade_id_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_subject_id_fkey";

-- DropIndex
DROP INDEX "assessments_grade_id_idx";

-- DropIndex
DROP INDEX "assessments_subject_id_idx";

-- DropIndex
DROP INDEX "courses_grade_id_idx";

-- DropIndex
DROP INDEX "courses_subject_id_idx";

-- AlterTable
ALTER TABLE "assessments" DROP COLUMN "course_id",
DROP COLUMN "grade_id",
DROP COLUMN "lesson_id",
DROP COLUMN "subject_id",
ADD COLUMN     "grade" "Grade" NOT NULL,
ADD COLUMN     "subject" "Subject" NOT NULL;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "grade_id",
DROP COLUMN "subject_id",
ADD COLUMN     "grade" "Grade" NOT NULL,
ADD COLUMN     "subject" "Subject" NOT NULL;

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "resources",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "video_type" "VideoType",
ADD COLUMN     "youtube_url" TEXT;

-- DropTable
DROP TABLE "grades";

-- DropTable
DROP TABLE "subjects";

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

-- AddForeignKey
ALTER TABLE "course_assessments" ADD CONSTRAINT "course_assessments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_assessments" ADD CONSTRAINT "course_assessments_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_assessments" ADD CONSTRAINT "lesson_assessments_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_assessments" ADD CONSTRAINT "lesson_assessments_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

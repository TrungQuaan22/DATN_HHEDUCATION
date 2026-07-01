/*
  Warnings:

  - You are about to drop the `lesson_assessments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "lesson_assessments" DROP CONSTRAINT "lesson_assessments_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "lesson_assessments" DROP CONSTRAINT "lesson_assessments_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_topic_id_fkey";

-- DropTable
DROP TABLE "lesson_assessments";

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

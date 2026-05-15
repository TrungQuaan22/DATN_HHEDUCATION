ALTER TABLE "courses"
ALTER COLUMN "grade" TYPE INTEGER
USING (
  CASE "grade"::text
    WHEN 'grade_9' THEN 9
    WHEN 'grade_10' THEN 10
    WHEN 'grade_11' THEN 11
    WHEN 'grade_12' THEN 12
    ELSE NULL
  END
);

ALTER TABLE "assessments"
ALTER COLUMN "grade" TYPE INTEGER
USING (
  CASE "grade"::text
    WHEN 'grade_9' THEN 9
    WHEN 'grade_10' THEN 10
    WHEN 'grade_11' THEN 11
    WHEN 'grade_12' THEN 12
    ELSE NULL
  END
);

DROP TYPE "Grade";

ALTER TABLE "courses"
  ADD COLUMN "sale_price" DECIMAL(12,2);

ALTER TABLE "courses"
  ADD CONSTRAINT "chk_courses_price_non_negative"
  CHECK ("price" >= 0) NOT VALID;

ALTER TABLE "courses"
  ADD CONSTRAINT "chk_courses_sale_price_non_negative"
  CHECK ("sale_price" IS NULL OR "sale_price" >= 0) NOT VALID;

ALTER TABLE "courses"
  ADD CONSTRAINT "chk_courses_sale_price_lt_price"
  CHECK ("sale_price" IS NULL OR "sale_price" < "price") NOT VALID;

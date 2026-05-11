-- Money is stored as integer VND minor unit (dong).
-- This avoids Decimal/floating point handling for a VND-only product.

ALTER TABLE "courses"
  ALTER COLUMN "price" TYPE BIGINT USING "price"::BIGINT;

ALTER TABLE "courses"
  ALTER COLUMN "sale_price" TYPE BIGINT USING "sale_price"::BIGINT;

ALTER TABLE "orders"
  ALTER COLUMN "total_amount" TYPE BIGINT USING "total_amount"::BIGINT;

ALTER TABLE "order_items"
  ALTER COLUMN "price_at_purchase" TYPE BIGINT USING "price_at_purchase"::BIGINT;

ALTER TABLE "payments"
  ALTER COLUMN "amount" TYPE BIGINT USING "amount"::BIGINT;

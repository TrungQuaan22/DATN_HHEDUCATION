-- Order and payment money values are bounded well within PostgreSQL INTEGER range.
-- Store them as integer VND unit for consistency with course pricing.

ALTER TABLE "orders"
  ALTER COLUMN "total_amount" TYPE INTEGER USING "total_amount"::INTEGER;

ALTER TABLE "order_items"
  ALTER COLUMN "price_at_purchase" TYPE INTEGER USING "price_at_purchase"::INTEGER;

ALTER TABLE "payments"
  ALTER COLUMN "amount" TYPE INTEGER USING "amount"::INTEGER;

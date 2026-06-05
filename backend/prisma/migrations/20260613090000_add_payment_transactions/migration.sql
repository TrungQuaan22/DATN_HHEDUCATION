-- Add a provider transaction ledger without removing legacy payment payload fields.
-- This is an expand-only migration so existing payment rows remain safe.
CREATE TYPE "PaymentTransactionDirection" AS ENUM ('in', 'out');

CREATE TYPE "PaymentTransactionMatchStatus" AS ENUM (
  'matched',
  'unmatched',
  'manual_review',
  'ignored'
);

CREATE TABLE "payment_transactions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "payment_id" UUID,
  "order_id" UUID,
  "provider" VARCHAR(50) NOT NULL,
  "provider_event_id" VARCHAR(255),
  "transaction_ref" VARCHAR(255),
  "order_invoice_number" VARCHAR(50),
  "amount" INTEGER NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'VND',
  "direction" "PaymentTransactionDirection" NOT NULL,
  "transaction_date" TIMESTAMP(3),
  "raw_payload" JSONB,
  "match_status" "PaymentTransactionMatchStatus" NOT NULL DEFAULT 'unmatched',
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payment_transactions_payment_id_fkey"
    FOREIGN KEY ("payment_id") REFERENCES "payments"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "payment_transactions_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "payment_transactions_provider_provider_event_id_key"
  ON "payment_transactions"("provider", "provider_event_id");

CREATE UNIQUE INDEX "payment_transactions_provider_transaction_ref_key"
  ON "payment_transactions"("provider", "transaction_ref");

CREATE INDEX "payment_transactions_order_id_idx"
  ON "payment_transactions"("order_id");

CREATE INDEX "payment_transactions_payment_id_idx"
  ON "payment_transactions"("payment_id");

CREATE INDEX "payment_transactions_order_invoice_number_idx"
  ON "payment_transactions"("order_invoice_number");

CREATE INDEX "payment_transactions_provider_created_at_idx"
  ON "payment_transactions"("provider", "created_at");

CREATE INDEX "payment_transactions_match_status_idx"
  ON "payment_transactions"("match_status");

-- Backfill only existing payments that already have provider transaction evidence.
-- Pending QR payments with no webhook/raw transaction are not real transactions yet.
INSERT INTO "payment_transactions" (
  "payment_id",
  "order_id",
  "provider",
  "provider_event_id",
  "transaction_ref",
  "order_invoice_number",
  "amount",
  "currency",
  "direction",
  "transaction_date",
  "raw_payload",
  "match_status",
  "metadata"
)
SELECT
  p."id",
  p."order_id",
  p."provider",
  p."raw_payload" ->> 'id',
  p."transaction_ref",
  COALESCE(p."provider_payment_id", o."order_invoice_number"),
  p."amount",
  p."currency",
  'in'::"PaymentTransactionDirection",
  p."paid_at",
  p."raw_payload",
  CASE p."status"
    WHEN 'success' THEN 'matched'::"PaymentTransactionMatchStatus"
    WHEN 'late_success' THEN 'manual_review'::"PaymentTransactionMatchStatus"
    WHEN 'manual_review' THEN 'manual_review'::"PaymentTransactionMatchStatus"
    WHEN 'failed' THEN 'ignored'::"PaymentTransactionMatchStatus"
    WHEN 'cancelled' THEN 'ignored'::"PaymentTransactionMatchStatus"
    ELSE 'unmatched'::"PaymentTransactionMatchStatus"
  END,
  p."metadata"
FROM "payments" p
JOIN "orders" o ON o."id" = p."order_id"
WHERE p."raw_payload" IS NOT NULL
   OR p."transaction_ref" IS NOT NULL
ON CONFLICT DO NOTHING;

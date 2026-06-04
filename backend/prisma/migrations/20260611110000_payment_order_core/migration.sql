-- Extend payment and enrollment state for QR/webhook payment flows.
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'late_success';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'manual_review';
ALTER TYPE "EnrollmentSource" ADD VALUE IF NOT EXISTS 'free';

-- Store provider-specific payment display and reconciliation metadata.
ALTER TABLE "payments"
  ADD COLUMN "provider_payment_id" VARCHAR(255),
  ADD COLUMN "checkout_url" VARCHAR(1000),
  ADD COLUMN "qr_code_url" VARCHAR(1000),
  ADD COLUMN "expires_at" TIMESTAMP(3),
  ADD COLUMN "metadata" JSONB;

CREATE INDEX "payments_provider_provider_payment_id_idx"
  ON "payments"("provider", "provider_payment_id");

CREATE INDEX "payments_expires_at_idx"
  ON "payments"("expires_at");

-- Shared idempotency storage for order/payment/assessment commands.
CREATE TABLE "idempotency_keys" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "scope" VARCHAR(100) NOT NULL,
  "key" VARCHAR(255) NOT NULL,
  "user_id" UUID,
  "request_hash" VARCHAR(128) NOT NULL,
  "status_code" INTEGER,
  "response_body" JSONB,
  "processing_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "idempotency_keys_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "idempotency_keys_scope_key_key"
  ON "idempotency_keys"("scope", "key");

CREATE INDEX "idempotency_keys_user_id_idx"
  ON "idempotency_keys"("user_id");

CREATE INDEX "idempotency_keys_expires_at_idx"
  ON "idempotency_keys"("expires_at");

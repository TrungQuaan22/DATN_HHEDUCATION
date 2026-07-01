-- Provider raw payloads now live in webhook_events.payload and
-- payment_transactions.raw_payload. Payment remains the order-centric
-- business state and no longer stores provider payloads directly.
ALTER TABLE "payments" DROP COLUMN IF EXISTS "raw_payload";

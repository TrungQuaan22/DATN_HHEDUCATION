-- Idempotency behavior now lives only in idempotency_keys.
-- orders should remain a pure business table.
DROP INDEX IF EXISTS "orders_user_id_idempotency_key_key";

ALTER TABLE "orders" DROP COLUMN IF EXISTS "idempotency_key";

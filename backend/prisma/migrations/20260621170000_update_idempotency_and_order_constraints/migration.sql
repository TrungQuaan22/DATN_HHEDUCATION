-- Truncate existing idempotency keys to avoid constraints errors on non-null user_id and new unique constraints
TRUNCATE TABLE "idempotency_keys";

-- DropForeignKey
ALTER TABLE "idempotency_keys" DROP CONSTRAINT "idempotency_keys_user_id_fkey";

-- DropIndex
DROP INDEX "idempotency_keys_scope_key_key";

-- DropIndex
DROP INDEX "idempotency_keys_user_id_idx";

-- AlterTable
ALTER TABLE "idempotency_keys" ALTER COLUMN "user_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_user_id_scope_key_key" ON "idempotency_keys"("user_id", "scope", "key");

-- AddForeignKey
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Custom migration: partial unique index for pending order per user
CREATE UNIQUE INDEX orders_one_pending_per_user
ON orders(user_id)
WHERE status = 'pending';

-- Custom migration: partial unique index for pending payment per order
CREATE UNIQUE INDEX payments_one_pending_per_order
ON payments(order_id)
WHERE status = 'pending';

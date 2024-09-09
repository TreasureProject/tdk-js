-- CreateTable
CREATE TABLE "public"."transaction_error_log" (
    "id" TEXT NOT NULL,
    "queue_id" TEXT NOT NULL,
    "queued_at" TIMESTAMP(3) NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "signer_address" TEXT NOT NULL,
    "account_address" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "function_name" TEXT NOT NULL,
    "error_message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_error_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transaction_error_log_queue_id_key" ON "public"."transaction_error_log"("queue_id");

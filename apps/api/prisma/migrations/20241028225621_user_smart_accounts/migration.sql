-- DropIndex
DROP INDEX "public"."user_address_key";

-- DropIndex
DROP INDEX "public"."user_email_key";

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "address",
DROP COLUMN "email",
ADD COLUMN     "external_user_id" TEXT,
ADD COLUMN     "external_wallet_address" VARCHAR(42);

-- AlterTable
ALTER TABLE "public"."user_profile" ADD COLUMN     "email" TEXT;

-- CreateTable
CREATE TABLE "public"."user_smart_account" (
    "id" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "initial_email" TEXT,
    "initial_wallet_address" VARCHAR(42) NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_smart_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_smart_account_user_id_idx" ON "public"."user_smart_account"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_smart_account_chain_id_address_key" ON "public"."user_smart_account"("chain_id", "address");

-- CreateIndex
CREATE UNIQUE INDEX "user_external_user_id_key" ON "public"."user"("external_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_external_wallet_address_key" ON "public"."user"("external_wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_email_key" ON "public"."user_profile"("email");

-- AddForeignKey
ALTER TABLE "public"."user_smart_account" ADD CONSTRAINT "user_smart_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

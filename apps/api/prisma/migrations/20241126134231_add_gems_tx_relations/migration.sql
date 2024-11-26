/*
  Warnings:

  - A unique constraint covering the columns `[legacy_user_profile_id,tx_id]` on the table `gems_tx` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,tx_id]` on the table `gems_tx` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."gems_tx_legacy_address_created_at_idx";

-- AlterTable
ALTER TABLE "public"."gems_tx" ADD COLUMN     "legacy_user_profile_id" TEXT;

-- CreateIndex
CREATE INDEX "gems_tx_legacy_user_profile_id_created_at_idx" ON "public"."gems_tx"("legacy_user_profile_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "gems_tx_legacy_user_profile_id_tx_id_key" ON "public"."gems_tx"("legacy_user_profile_id", "tx_id");

-- CreateIndex
CREATE UNIQUE INDEX "gems_tx_user_id_tx_id_key" ON "public"."gems_tx"("user_id", "tx_id");

-- AddForeignKey
ALTER TABLE "public"."gems_tx" ADD CONSTRAINT "gems_tx_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gems_tx" ADD CONSTRAINT "gems_tx_legacy_user_profile_id_fkey" FOREIGN KEY ("legacy_user_profile_id") REFERENCES "public"."user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

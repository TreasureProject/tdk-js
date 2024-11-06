/*
  Warnings:

  - You are about to drop the column `legacy_address` on the `user_notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `legacy_address` on the `user_social_account` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."user_notification_settings_type_legacy_address_key";

-- DropIndex
DROP INDEX "public"."user_social_account_network_legacy_address_key";

-- AlterTable
ALTER TABLE "public"."user_notification_settings" DROP COLUMN "legacy_address",
ADD COLUMN     "legacy_user_profile_id" TEXT;

-- AlterTable
ALTER TABLE "public"."user_social_account" DROP COLUMN "legacy_address",
ADD COLUMN     "legacy_user_profile_id" TEXT;

-- CreateIndex
CREATE INDEX "user_notification_settings_legacy_user_profile_id_idx" ON "public"."user_notification_settings"("legacy_user_profile_id");

-- CreateIndex
CREATE INDEX "user_social_account_legacy_user_profile_id_idx" ON "public"."user_social_account"("legacy_user_profile_id");

-- DropIndex
DROP INDEX "public"."user_external_wallet_address_key";

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "external_wallet_address",
ALTER COLUMN "external_user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_smart_account" DROP COLUMN "initial_email";
ALTER TABLE "public"."user_smart_account" RENAME COLUMN "initial_wallet_address" TO "ecosystem_wallet_address";

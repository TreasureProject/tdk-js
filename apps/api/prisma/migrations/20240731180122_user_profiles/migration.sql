-- CreateEnum
CREATE TYPE "SocialNetwork" AS ENUM ('APPLE', 'DISCORD', 'FARCASTER', 'GOOGLE', 'STEAM', 'TWITCH', 'TWITTER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BADGE', 'BID_ACTIVITY', 'ITEM_SOLD', 'ITEM_PURCHASED', 'MARKETING');

-- DropIndex
DROP INDEX "user_smart_account_address_key";

-- DropIndex
DROP INDEX "user_treasure_tag_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "treasure_tag",
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "phone_number" TEXT;
ALTER TABLE "user" RENAME COLUMN "smart_account_address" TO "address";
ALTER TABLE "user" ALTER COLUMN "address" TYPE VARCHAR(42);

-- CreateTable
CREATE TABLE "user_profile" (
    "id" TEXT NOT NULL,
    "tag" TEXT,
    "discriminant" SMALLINT,
    "tag_claimed" BOOLEAN NOT NULL DEFAULT false,
    "tag_modified_at" TIMESTAMP(3),
    "tag_last_checked_at" TIMESTAMP(3),
    "email_security_phrase" TEXT,
    "email_security_phrase_updated_at" TIMESTAMP(3),
    "featured_nft_ids" TEXT[],
    "featured_badge_ids" TEXT[],
    "highly_featured_badge_id" TEXT,
    "about" TEXT,
    "pfp" TEXT,
    "banner" TEXT,
    "show_magic_balance" BOOLEAN NOT NULL DEFAULT true,
    "show_eth_balance" BOOLEAN NOT NULL DEFAULT true,
    "show_gems_balance" BOOLEAN NOT NULL DEFAULT true,
    "legacy_address" VARCHAR(42),
    "testnet_faucet_last_used_at" TIMESTAMP(3),
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_social_account" (
    "id" TEXT NOT NULL,
    "network" "SocialNetwork" NOT NULL,
    "account_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_handle" TEXT,
    "account_data" JSONB,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "legacy_address" VARCHAR(42),
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_social_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_settings" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "threshold" INTEGER,
    "is_enabled_email" BOOLEAN NOT NULL DEFAULT true,
    "is_enabled_in_app" BOOLEAN NOT NULL DEFAULT true,
    "legacy_address" VARCHAR(42),
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_legacy_address_key" ON "user_profile"("legacy_address");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_user_id_key" ON "user_profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_tag_discriminant_key" ON "user_profile"("tag", "discriminant");

-- CreateIndex
CREATE UNIQUE INDEX "user_social_account_legacy_address_key" ON "user_social_account"("legacy_address");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_settings_legacy_address_key" ON "user_notification_settings"("legacy_address");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_settings_user_id_key" ON "user_notification_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_settings_type_user_id_key" ON "user_notification_settings"("type", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_settings_type_legacy_address_key" ON "user_notification_settings"("type", "legacy_address");

-- CreateIndex
CREATE UNIQUE INDEX "user_address_key" ON "user"("address");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_number_key" ON "user"("phone_number");

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_social_account" ADD CONSTRAINT "user_social_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

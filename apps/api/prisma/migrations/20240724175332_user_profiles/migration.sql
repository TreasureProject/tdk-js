-- DropIndex
DROP INDEX "user_smart_account_address_key";

-- DropIndex
DROP INDEX "user_treasure_tag_key";

-- AlterTable
ALTER TABLE "user"
DROP COLUMN    "treasure_tag",
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "user_profile_id" TEXT;
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
    "testnet_faucet_last_used_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_user_id_key" ON "user_profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_tag_discriminant_key" ON "user_profile"("tag", "discriminant");

-- CreateIndex
CREATE UNIQUE INDEX "user_address_key" ON "user"("address");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_number_key" ON "user"("phone_number");

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed user_profile
INSERT INTO "user_profile" ("id", "user_id", "updated_at") SELECT "id", "id", CURRENT_TIMESTAMP FROM "user";
UPDATE "user" SET "user_profile_id" = "id";

-- Make user_profile_id not null
ALTER TABLE "user" ALTER COLUMN "user_profile_id" SET NOT NULL;

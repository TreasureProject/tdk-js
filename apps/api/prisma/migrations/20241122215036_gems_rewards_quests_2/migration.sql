/*
  Warnings:

  - The values [Nft,Coin] on the enum `reward_type_enum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `legacy_address` on the `gems_summary` table. All the data in the column will be lost.
  - The primary key for the `gems_tx` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `chest_seasons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chest_type_rewards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chest_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quest_configs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quest_stats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rewards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_quests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vouchers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[legacy_user_profile_id]` on the table `gems_summary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tx_id]` on the table `gems_tx` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `gems_tx` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."reward_type_enum_new" AS ENUM ('NFT', 'COIN');
ALTER TYPE "public"."reward_type_enum" RENAME TO "reward_type_enum_old";
ALTER TYPE "public"."reward_type_enum_new" RENAME TO "reward_type_enum";
DROP TYPE "public"."reward_type_enum_old" CASCADE;
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."chest_type_rewards" DROP CONSTRAINT "chest_type_rewards_chest_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."chest_type_rewards" DROP CONSTRAINT "chest_type_rewards_reward_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."chest_types" DROP CONSTRAINT "chest_types_chest_season_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."chests" DROP CONSTRAINT "chests_chest_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."vouchers" DROP CONSTRAINT "vouchers_chest_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."vouchers" DROP CONSTRAINT "vouchers_chest_type_id_fkey";

-- DropIndex
DROP INDEX "public"."gems_summary_created_at_idx";

-- DropIndex
DROP INDEX "public"."gems_summary_gems_idx";

-- DropIndex
DROP INDEX "public"."gems_summary_legacy_address_key";

-- DropIndex
DROP INDEX "public"."gems_summary_shards_earned_idx";

-- DropIndex
DROP INDEX "public"."gems_summary_shards_idx";

-- DropIndex
DROP INDEX "public"."gems_summary_updated_at_idx";

-- DropIndex
DROP INDEX "public"."gems_tx_amount_idx";

-- DropIndex
DROP INDEX "public"."gems_tx_amount_shards_idx";

-- DropIndex
DROP INDEX "public"."gems_tx_category_idx";

-- DropIndex
DROP INDEX "public"."gems_tx_created_at_idx";

-- DropIndex
DROP INDEX "public"."gems_tx_legacy_address_idx";

-- DropIndex
DROP INDEX "public"."gems_tx_user_id_idx";

-- AlterTable
ALTER TABLE "public"."gems_summary" DROP COLUMN "legacy_address",
ADD COLUMN     "legacy_user_profile_id" TEXT;

-- AlterTable
ALTER TABLE "public"."gems_tx" DROP CONSTRAINT "gems_tx_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "gems_tx_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "public"."chest_seasons";

-- DropTable
DROP TABLE "public"."chest_type_rewards";

-- DropTable
DROP TABLE "public"."chest_types";

-- DropTable
DROP TABLE "public"."chests";

-- DropTable
DROP TABLE "public"."quest_configs";

-- DropTable
DROP TABLE "public"."quest_stats";

-- DropTable
DROP TABLE "public"."rewards";

-- DropTable
DROP TABLE "public"."user_quests";

-- DropTable
DROP TABLE "public"."vouchers";

-- CreateTable
CREATE TABLE "public"."reward" (
    "id" TEXT NOT NULL,
    "reward_id" TEXT NOT NULL,
    "type" "public"."reward_type_enum" NOT NULL,
    "sub_type" TEXT,
    "chain" TEXT NOT NULL,
    "token_address" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "slug" TEXT,
    "token_id" TEXT,
    "quantity" INTEGER,
    "quantity_wei" TEXT,

    CONSTRAINT "reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chest_season" (
    "id" TEXT NOT NULL,
    "chest_season_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "chest_season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chest_type" (
    "id" TEXT NOT NULL,
    "chest_type_id" TEXT NOT NULL,
    "chest_season_id" TEXT,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "chest_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chest_type_reward" (
    "id" TEXT NOT NULL,
    "chest_type_id" TEXT NOT NULL,
    "reward_id" TEXT NOT NULL,

    CONSTRAINT "chest_type_reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chest" (
    "id" TEXT NOT NULL,
    "status" "public"."chest_status_enum" NOT NULL DEFAULT 'AVAILABLE',
    "chest_type_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimed_at" TIMESTAMPTZ(6),

    CONSTRAINT "chest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."voucher" (
    "id" TEXT NOT NULL,
    "gems_value" INTEGER NOT NULL,
    "nonce" TEXT NOT NULL,
    "status" "public"."voucher_status_enum" NOT NULL DEFAULT 'UNCLAIMED',
    "chest_type_id" TEXT NOT NULL,
    "chest_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimed_at" TIMESTAMPTZ(6),
    "user_id" TEXT,
    "legacy_user_profile_id" TEXT,

    CONSTRAINT "voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quest_config" (
    "id" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "quest_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_quest" (
    "id" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "quest_status" "public"."quest_status_enum" NOT NULL,
    "is_hidden_by_user" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "completed_at" TIMESTAMPTZ(6),
    "acked_at" TIMESTAMPTZ(6),
    "abandoned_at" TIMESTAMPTZ(6),
    "progress_summary" JSONB,
    "notification_id" TEXT,
    "user_id" TEXT,
    "legacy_user_profile_id" TEXT,

    CONSTRAINT "user_quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quest_stat" (
    "id" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "quest_stat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reward_reward_id_key" ON "public"."reward"("reward_id");

-- CreateIndex
CREATE UNIQUE INDEX "chest_season_chest_season_id_key" ON "public"."chest_season"("chest_season_id");

-- CreateIndex
CREATE UNIQUE INDEX "chest_type_chest_type_id_key" ON "public"."chest_type"("chest_type_id");

-- CreateIndex
CREATE INDEX "chest_type_created_at_idx" ON "public"."chest_type"("created_at");

-- CreateIndex
CREATE INDEX "chest_type_updated_at_idx" ON "public"."chest_type"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "chest_type_reward_chest_type_id_reward_id_key" ON "public"."chest_type_reward"("chest_type_id", "reward_id");

-- CreateIndex
CREATE INDEX "chest_status_idx" ON "public"."chest"("status");

-- CreateIndex
CREATE INDEX "chest_chest_type_id_idx" ON "public"."chest"("chest_type_id");

-- CreateIndex
CREATE INDEX "chest_created_at_idx" ON "public"."chest"("created_at");

-- CreateIndex
CREATE INDEX "chest_claimed_at_idx" ON "public"."chest"("claimed_at");

-- CreateIndex
CREATE UNIQUE INDEX "voucher_chest_id_key" ON "public"."voucher"("chest_id");

-- CreateIndex
CREATE INDEX "voucher_user_id_idx" ON "public"."voucher"("user_id");

-- CreateIndex
CREATE INDEX "voucher_legacy_user_profile_id_idx" ON "public"."voucher"("legacy_user_profile_id");

-- CreateIndex
CREATE INDEX "voucher_status_idx" ON "public"."voucher"("status");

-- CreateIndex
CREATE INDEX "voucher_status_user_id_idx" ON "public"."voucher"("status", "user_id");

-- CreateIndex
CREATE INDEX "voucher_status_legacy_user_profile_id_idx" ON "public"."voucher"("status", "legacy_user_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "quest_config_quest_id_key" ON "public"."quest_config"("quest_id");

-- CreateIndex
CREATE INDEX "user_quest_user_id_idx" ON "public"."user_quest"("user_id");

-- CreateIndex
CREATE INDEX "user_quest_legacy_user_profile_id_idx" ON "public"."user_quest"("legacy_user_profile_id");

-- CreateIndex
CREATE INDEX "user_quest_quest_status_user_id_idx" ON "public"."user_quest"("quest_status", "user_id");

-- CreateIndex
CREATE INDEX "user_quest_quest_status_legacy_user_profile_id_idx" ON "public"."user_quest"("quest_status", "legacy_user_profile_id");

-- CreateIndex
CREATE INDEX "user_quest_quest_status_quest_id_idx" ON "public"."user_quest"("quest_status", "quest_id");

-- CreateIndex
CREATE INDEX "user_quest_quest_status_quest_id_completed_at_idx" ON "public"."user_quest"("quest_status", "quest_id", "completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_quest_user_id_quest_id_key" ON "public"."user_quest"("user_id", "quest_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_quest_legacy_user_profile_id_quest_id_key" ON "public"."user_quest"("legacy_user_profile_id", "quest_id");

-- CreateIndex
CREATE UNIQUE INDEX "quest_stat_quest_id_key" ON "public"."quest_stat"("quest_id");

-- CreateIndex
CREATE UNIQUE INDEX "gems_summary_legacy_user_profile_id_key" ON "public"."gems_summary"("legacy_user_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "gems_tx_tx_id_key" ON "public"."gems_tx"("tx_id");

-- CreateIndex
CREATE INDEX "gems_tx_user_id_created_at_idx" ON "public"."gems_tx"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "gems_tx_legacy_address_created_at_idx" ON "public"."gems_tx"("legacy_address", "created_at");

-- AddForeignKey
ALTER TABLE "public"."gems_summary" ADD CONSTRAINT "gems_summary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gems_summary" ADD CONSTRAINT "gems_summary_legacy_user_profile_id_fkey" FOREIGN KEY ("legacy_user_profile_id") REFERENCES "public"."user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chest_type" ADD CONSTRAINT "chest_type_chest_season_id_fkey" FOREIGN KEY ("chest_season_id") REFERENCES "public"."chest_season"("chest_season_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chest_type_reward" ADD CONSTRAINT "chest_type_reward_chest_type_id_fkey" FOREIGN KEY ("chest_type_id") REFERENCES "public"."chest_type"("chest_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chest_type_reward" ADD CONSTRAINT "chest_type_reward_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."reward"("reward_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chest" ADD CONSTRAINT "chest_chest_type_id_fkey" FOREIGN KEY ("chest_type_id") REFERENCES "public"."chest_type"("chest_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."voucher" ADD CONSTRAINT "voucher_chest_type_id_fkey" FOREIGN KEY ("chest_type_id") REFERENCES "public"."chest_type"("chest_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."voucher" ADD CONSTRAINT "voucher_chest_id_fkey" FOREIGN KEY ("chest_id") REFERENCES "public"."chest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."voucher" ADD CONSTRAINT "voucher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."voucher" ADD CONSTRAINT "voucher_legacy_user_profile_id_fkey" FOREIGN KEY ("legacy_user_profile_id") REFERENCES "public"."user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_quest" ADD CONSTRAINT "user_quest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_quest" ADD CONSTRAINT "user_quest_legacy_user_profile_id_fkey" FOREIGN KEY ("legacy_user_profile_id") REFERENCES "public"."user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "public"."reward_type_enum" AS ENUM ('Nft', 'Coin');

-- CreateEnum
CREATE TYPE "public"."chest_status_enum" AS ENUM ('AVAILABLE', 'CLAIMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."voucher_status_enum" AS ENUM ('UNCLAIMED', 'CLAIMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."quest_status_enum" AS ENUM ('ACTIVE', 'ABANDONED', 'COMPLETE', 'INACTIVE');

-- CreateTable
CREATE TABLE "public"."gems_summary" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "legacy_address" VARCHAR(42),
    "gems" INTEGER NOT NULL DEFAULT 0,
    "gems_earned" INTEGER NOT NULL DEFAULT 0,
    "shards" INTEGER NOT NULL DEFAULT 0,
    "shards_earned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "gems_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gems_tx" (
    "tx_id" TEXT NOT NULL,
    "user_id" TEXT,
    "legacy_address" TEXT,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "amount_shards" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "internal_note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gems_tx_pkey" PRIMARY KEY ("tx_id")
);

-- CreateTable
CREATE TABLE "public"."rewards" (
    "id" TEXT NOT NULL,
    "type" "public"."reward_type_enum" NOT NULL,
    "sub_type" TEXT,
    "chain" TEXT NOT NULL,
    "token_address" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT,
    "token_id" TEXT,
    "quantity" INTEGER,
    "quantity_wei" TEXT,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chest_seasons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chest_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chest_types" (
    "id" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "chest_season_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "chest_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chest_type_rewards" (
    "chest_type_id" TEXT NOT NULL,
    "reward_id" TEXT NOT NULL,

    CONSTRAINT "chest_type_rewards_pkey" PRIMARY KEY ("chest_type_id","reward_id")
);

-- CreateTable
CREATE TABLE "public"."chests" (
    "id" SERIAL NOT NULL,
    "status" "public"."chest_status_enum" NOT NULL DEFAULT 'AVAILABLE',
    "chest_type_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimed_at" TIMESTAMPTZ(6),

    CONSTRAINT "chests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vouchers" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "legacy_address" VARCHAR(42),
    "gems_value" INTEGER NOT NULL,
    "nonce" TEXT NOT NULL,
    "status" "public"."voucher_status_enum" NOT NULL DEFAULT 'UNCLAIMED',
    "chest_type_id" TEXT NOT NULL,
    "chest_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimed_at" TIMESTAMPTZ(6),

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quest_configs" (
    "quest_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "quest_configs_pkey" PRIMARY KEY ("quest_id")
);

-- CreateTable
CREATE TABLE "public"."user_quests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "legacy_address" VARCHAR(42),
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

    CONSTRAINT "user_quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quest_stats" (
    "quest_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "quest_stats_pkey" PRIMARY KEY ("quest_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gems_summary_user_id_key" ON "public"."gems_summary"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "gems_summary_legacy_address_key" ON "public"."gems_summary"("legacy_address");

-- CreateIndex
CREATE INDEX "gems_summary_gems_idx" ON "public"."gems_summary"("gems");

-- CreateIndex
CREATE INDEX "gems_summary_gems_earned_idx" ON "public"."gems_summary"("gems_earned");

-- CreateIndex
CREATE INDEX "gems_summary_shards_idx" ON "public"."gems_summary"("shards");

-- CreateIndex
CREATE INDEX "gems_summary_shards_earned_idx" ON "public"."gems_summary"("shards_earned");

-- CreateIndex
CREATE INDEX "gems_summary_created_at_idx" ON "public"."gems_summary"("created_at");

-- CreateIndex
CREATE INDEX "gems_summary_updated_at_idx" ON "public"."gems_summary"("updated_at");

-- CreateIndex
CREATE INDEX "gems_tx_user_id_idx" ON "public"."gems_tx"("user_id");

-- CreateIndex
CREATE INDEX "gems_tx_legacy_address_idx" ON "public"."gems_tx"("legacy_address");

-- CreateIndex
CREATE INDEX "gems_tx_category_idx" ON "public"."gems_tx"("category");

-- CreateIndex
CREATE INDEX "gems_tx_amount_idx" ON "public"."gems_tx"("amount");

-- CreateIndex
CREATE INDEX "gems_tx_amount_shards_idx" ON "public"."gems_tx"("amount_shards");

-- CreateIndex
CREATE INDEX "gems_tx_created_at_idx" ON "public"."gems_tx"("created_at");

-- CreateIndex
CREATE INDEX "chest_seasons_active_idx" ON "public"."chest_seasons"("active");

-- CreateIndex
CREATE INDEX "chest_types_created_at_idx" ON "public"."chest_types"("created_at");

-- CreateIndex
CREATE INDEX "chest_types_updated_at_idx" ON "public"."chest_types"("updated_at");

-- CreateIndex
CREATE INDEX "chests_status_idx" ON "public"."chests"("status");

-- CreateIndex
CREATE INDEX "chests_chest_type_id_idx" ON "public"."chests"("chest_type_id");

-- CreateIndex
CREATE INDEX "chests_created_at_idx" ON "public"."chests"("created_at");

-- CreateIndex
CREATE INDEX "chests_claimed_at_idx" ON "public"."chests"("claimed_at");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_chest_id_key" ON "public"."vouchers"("chest_id");

-- CreateIndex
CREATE INDEX "vouchers_user_id_idx" ON "public"."vouchers"("user_id");

-- CreateIndex
CREATE INDEX "vouchers_legacy_address_idx" ON "public"."vouchers"("legacy_address");

-- CreateIndex
CREATE INDEX "vouchers_status_idx" ON "public"."vouchers"("status");

-- CreateIndex
CREATE INDEX "vouchers_status_user_id_idx" ON "public"."vouchers"("status", "user_id");

-- CreateIndex
CREATE INDEX "vouchers_status_legacy_address_idx" ON "public"."vouchers"("status", "legacy_address");

-- CreateIndex
CREATE INDEX "vouchers_chest_type_id_idx" ON "public"."vouchers"("chest_type_id");

-- CreateIndex
CREATE INDEX "vouchers_created_at_idx" ON "public"."vouchers"("created_at");

-- CreateIndex
CREATE INDEX "vouchers_claimed_at_idx" ON "public"."vouchers"("claimed_at");

-- CreateIndex
CREATE INDEX "user_quests_user_id_idx" ON "public"."user_quests"("user_id");

-- CreateIndex
CREATE INDEX "user_quests_legacy_address_idx" ON "public"."user_quests"("legacy_address");

-- CreateIndex
CREATE INDEX "user_quests_quest_status_user_id_idx" ON "public"."user_quests"("quest_status", "user_id");

-- CreateIndex
CREATE INDEX "user_quests_quest_status_legacy_address_idx" ON "public"."user_quests"("quest_status", "legacy_address");

-- CreateIndex
CREATE INDEX "user_quests_quest_status_quest_id_idx" ON "public"."user_quests"("quest_status", "quest_id");

-- CreateIndex
CREATE INDEX "user_quests_quest_status_quest_id_completed_at_idx" ON "public"."user_quests"("quest_status", "quest_id", "completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_quests_user_id_quest_id_key" ON "public"."user_quests"("user_id", "quest_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_quests_legacy_address_quest_id_key" ON "public"."user_quests"("legacy_address", "quest_id");

-- AddForeignKey
ALTER TABLE "public"."chest_types" ADD CONSTRAINT "chest_types_chest_season_id_fkey" FOREIGN KEY ("chest_season_id") REFERENCES "public"."chest_seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chest_type_rewards" ADD CONSTRAINT "chest_type_rewards_chest_type_id_fkey" FOREIGN KEY ("chest_type_id") REFERENCES "public"."chest_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chest_type_rewards" ADD CONSTRAINT "chest_type_rewards_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chests" ADD CONSTRAINT "chests_chest_type_id_fkey" FOREIGN KEY ("chest_type_id") REFERENCES "public"."chest_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vouchers" ADD CONSTRAINT "vouchers_chest_type_id_fkey" FOREIGN KEY ("chest_type_id") REFERENCES "public"."chest_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vouchers" ADD CONSTRAINT "vouchers_chest_id_fkey" FOREIGN KEY ("chest_id") REFERENCES "public"."chests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "smart_account";

-- CreateTable
CREATE TABLE "smart_account"."transactions_jsonb" (
    "_key" TEXT NOT NULL,
    "body" JSONB NOT NULL,

    CONSTRAINT "transactions_jsonb_pkey" PRIMARY KEY ("_key")
);

-- CreateTable
CREATE TABLE "smart_account"."treasure_accounts_jsonb" (
    "_key" TEXT NOT NULL,
    "body" JSONB NOT NULL,

    CONSTRAINT "treasure_accounts_jsonb_pkey" PRIMARY KEY ("_key")
);

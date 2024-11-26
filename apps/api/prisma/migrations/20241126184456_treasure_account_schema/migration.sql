-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "treasure_account";

-- CreateTable
CREATE TABLE IF NOT EXISTS "treasure_account"."transactions_jsonb" (
    "_key" TEXT NOT NULL,
    "body" JSONB NOT NULL,

    CONSTRAINT "transactions_jsonb_pkey" PRIMARY KEY ("_key")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "treasure_account"."accounts_jsonb" (
    "_key" TEXT NOT NULL,
    "body" JSONB NOT NULL,

    CONSTRAINT "accounts_jsonb_pkey" PRIMARY KEY ("_key")
);

CREATE OR REPLACE VIEW
    "treasure_account"."transactions" AS (
        SELECT
            (body ->> 'chain' :: text) AS chain,
            (body ->> 'chain_id' :: text) AS chain_id,
            (body ->> 'to_address' :: text) AS to_address,
            (body ->> 'id' :: text) AS id,
            (body ->> 'from_address' :: text) AS from_address,
            (body ->> 'transaction_hash' :: text) AS transaction_hash,
            ((body ->> 'block_number' :: text)) :: numeric AS block_number,
            ((body ->> 'value' :: text)) :: numeric AS value,
            ((body ->> 'transaction_index' :: text)) :: numeric AS transaction_index,
            ((body ->> 'receipt_effective_gas_price' :: text)) :: numeric AS receipt_effective_gas_price,
            ((body ->> 'receipt_status' :: text)) :: numeric AS receipt_status,
            ((body ->> 'receipt_gas_used' :: text)) :: numeric AS receipt_gas_used,
                to_timestamp(
                    (((body ->> 'block_timestamp' :: text)) :: numeric) :: double precision
            ) AS block_timestamp,
            ((body ->> 'gas_used' :: text)) :: numeric AS gas_used,
            ((body ->> 'receipt_cumulative_gas_used' :: text)) :: numeric AS receipt_cumulative_gas_used,
            ((body ->> 'gas' :: text)) :: numeric AS gas
        FROM
            treasure_account.transactions_jsonb
    );

CREATE OR REPLACE VIEW
    "treasure_account"."accounts" AS (
        SELECT
            (body ->> 'chain' :: text) AS chain,
            (body ->> 'account_admin' :: text) AS account_admin,
            (body ->> 'chain_id' :: text) AS chain_id,
                to_timestamp(
                    (((body ->> 'block_timestamp' :: text)) :: numeric) :: double precision
            ) AS block_timestamp,
            (body ->> 'id' :: text) AS id,
            (body ->> 'transaction_hash' :: text) AS transaction_hash,
            (body ->> 'account' :: text) AS account,
            ((body ->> 'log_index' :: text)) :: numeric AS log_index,
            ((body ->> 'block_number' :: text)) :: numeric AS block_number
        FROM
            treasure_account.accounts_jsonb
    );
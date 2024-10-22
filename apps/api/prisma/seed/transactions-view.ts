import { Prisma, type PrismaClient } from "@prisma/client";

const upsertTransactionsViewSql = Prisma.sql`
  CREATE OR REPLACE VIEW
    "smart_account"."transactions" AS (
        SELECT
            (body ->> 'chain'::text) AS chain,
            (body ->> 'chain_id'::text) AS chain_id,
            to_timestamp((((body ->> 'block_timestamp'::text))::numeric)::double precision) AS block_timestamp,
            (body ->> 'to_address'::text) AS to_address,
            (body ->> 'id'::text) AS id,
            (body ->> 'from_address'::text) AS from_address,
            (body ->> 'transaction_hash'::text) AS transaction_hash,
            ((body ->> 'block_number'::text))::numeric AS block_number,
            ((body ->> 'value'::text))::numeric AS value,
            ((body ->> 'transaction_index'::text))::numeric AS transaction_index
        FROM
            smart_account.transactions_jsonb
    );
`;

export default (prisma: PrismaClient) => {
  return prisma.$queryRaw(upsertTransactionsViewSql);
};

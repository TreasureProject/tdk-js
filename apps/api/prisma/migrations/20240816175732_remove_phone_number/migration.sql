/*
  Warnings:

  - You are about to drop the column `phone_number` on the `user` table. All the data in the column will be lost.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "smart_account";

-- DropIndex
DROP INDEX "public"."user_phone_number_key";

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "phone_number";

/*
  Warnings:

  - A unique constraint covering the columns `[legacy_address]` on the table `user_profile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "user_profile" DROP CONSTRAINT "user_profile_user_id_fkey";

-- AlterTable
ALTER TABLE "user_profile" ADD COLUMN     "legacy_address" VARCHAR(42),
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_legacy_address_key" ON "user_profile"("legacy_address");

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

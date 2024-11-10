/*
  Warnings:

  - The values [APPLE,FARCASTER,GOOGLE] on the enum `SocialNetwork` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SocialNetwork_new" AS ENUM ('DISCORD', 'STEAM', 'TWITCH', 'TWITTER');
ALTER TABLE "public"."user_social_account" ALTER COLUMN "network" TYPE "public"."SocialNetwork_new" USING ("network"::text::"public"."SocialNetwork_new");
ALTER TYPE "public"."SocialNetwork" RENAME TO "SocialNetwork_old";
ALTER TYPE "public"."SocialNetwork_new" RENAME TO "SocialNetwork";
DROP TYPE "public"."SocialNetwork_old";
COMMIT;

-- CreateIndex
CREATE INDEX "user_social_account_is_public_idx" ON "public"."user_social_account"("is_public");

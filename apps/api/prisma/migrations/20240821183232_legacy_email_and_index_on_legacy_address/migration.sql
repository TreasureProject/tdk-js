-- AlterTable
ALTER TABLE "public"."user_profile" ADD COLUMN     "legacy_email" TEXT;

-- CreateIndex
CREATE INDEX "user_profile_legacy_address_idx" ON "public"."user_profile"("legacy_address");

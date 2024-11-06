-- AlterTable
ALTER TABLE "public"."user_profile" ADD COLUMN     "legacy_profile_migrated_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "user_profile_legacy_email_legacy_email_verified_at_idx" ON "public"."user_profile"("legacy_email", "legacy_email_verified_at");

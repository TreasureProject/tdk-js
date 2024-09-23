-- DropIndex
DROP INDEX "public"."user_notification_settings_user_id_key";

-- CreateIndex
CREATE INDEX "user_notification_settings_user_id_idx" ON "public"."user_notification_settings"("user_id");

-- CreateIndex
CREATE INDEX "user_social_account_user_id_idx" ON "public"."user_social_account"("user_id");

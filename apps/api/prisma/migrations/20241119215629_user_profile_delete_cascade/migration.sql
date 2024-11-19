-- AddForeignKey
ALTER TABLE "public"."user_social_account" ADD CONSTRAINT "user_social_account_legacy_user_profile_id_fkey" FOREIGN KEY ("legacy_user_profile_id") REFERENCES "public"."user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_notification_settings" ADD CONSTRAINT "user_notification_settings_legacy_user_profile_id_fkey" FOREIGN KEY ("legacy_user_profile_id") REFERENCES "public"."user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

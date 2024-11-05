-- DropForeignKey
ALTER TABLE "public"."_BackendWalletToProject" DROP CONSTRAINT "_BackendWalletToProject_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_BackendWalletToProject" DROP CONSTRAINT "_BackendWalletToProject_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CallTargetToProject" DROP CONSTRAINT "_CallTargetToProject_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CallTargetToProject" DROP CONSTRAINT "_CallTargetToProject_B_fkey";

-- AlterTable
ALTER TABLE "public"."user_profile" DROP COLUMN "tag_claimed",
DROP COLUMN "tag_last_checked_at",
DROP COLUMN "tag_modified_at";

-- DropTable
DROP TABLE "public"."_BackendWalletToProject";

-- DropTable
DROP TABLE "public"."_CallTargetToProject";

-- DropTable
DROP TABLE "public"."backend_wallet";

-- DropTable
DROP TABLE "public"."call_target";

-- DropTable
DROP TABLE "public"."project";

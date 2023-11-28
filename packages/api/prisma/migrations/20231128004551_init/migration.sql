-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "redirect_uris" TEXT[],
    "icon" TEXT,
    "cover" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backend_wallet" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backend_wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_target" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "smart_account_address" TEXT NOT NULL,
    "email" TEXT,
    "treasure_tag" TEXT,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BackendWalletToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CallTargetToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "project_slug_key" ON "project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "backend_wallet_chainId_address_key" ON "backend_wallet"("chainId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "call_target_chainId_address_key" ON "call_target"("chainId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "user_smart_account_address_key" ON "user"("smart_account_address");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_treasure_tag_key" ON "user"("treasure_tag");

-- CreateIndex
CREATE UNIQUE INDEX "_BackendWalletToProject_AB_unique" ON "_BackendWalletToProject"("A", "B");

-- CreateIndex
CREATE INDEX "_BackendWalletToProject_B_index" ON "_BackendWalletToProject"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CallTargetToProject_AB_unique" ON "_CallTargetToProject"("A", "B");

-- CreateIndex
CREATE INDEX "_CallTargetToProject_B_index" ON "_CallTargetToProject"("B");

-- AddForeignKey
ALTER TABLE "_BackendWalletToProject" ADD CONSTRAINT "_BackendWalletToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "backend_wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BackendWalletToProject" ADD CONSTRAINT "_BackendWalletToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CallTargetToProject" ADD CONSTRAINT "_CallTargetToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "call_target"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CallTargetToProject" ADD CONSTRAINT "_CallTargetToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

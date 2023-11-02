import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.project.upsert({
      where: { slug: "platform" },
      update: {},
      create: {
        slug: "platform",
        name: "Treasure",
        projectId: "platform",
        redirectUris: [
          "https://app.treasure.lol",
          "https://app-testnet.treasure.lol",
        ],
      },
    });

    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
})();

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
        redirectUris: ["http://localhost:5174"],
        callTargets: {
          create: [
            {
              chainId: 421614,
              address: "0x55d0cf68a1afe0932aff6f36c87efa703508191c", // MAGIC
            },
          ],
        },
      },
    });

    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
})();

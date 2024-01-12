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
            {
              chainId: 421614,
              address: "0x9d012712d24c90dded4574430b9e6065183896be", // Consumables
            },
            {
              chainId: 421614,
              address: "0x413bf05048ef9953a94538a5b2c7ae86f41e531b", // Harvester (Lupus Magus)
            },
            {
              chainId: 421614,
              address: "0xb9fbc2b364e9dbe61b3c083fcb2f85fc4520b25d", // NftHandler (Lupus Magus)
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

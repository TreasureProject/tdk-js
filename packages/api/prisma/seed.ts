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
              address: "0x466d20a94e280bb419031161a6a7508438ad436f", // Harvester (Emerion)
            },
            {
              chainId: 421614,
              address: "0xff1e4795433e12816cb3b3f6342af02e8b942ffb", // NftHandler (Emerion)
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

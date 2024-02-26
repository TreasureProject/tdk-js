import { PrismaClient } from "@prisma/client";
import {
  type Contract,
  PROJECT_SLUGS,
  type ProjectSlug,
  getContractAddress,
} from "@treasure/tdk-core";
import { arbitrum, arbitrumSepolia } from "viem/chains";

type Environment = "local" | "dev" | "prod";

const NAMES: Record<ProjectSlug, string> = {
  app: "Treasure",
  zeeverse: "Zeeverse",
};

const REDIRECT_URIS: Record<ProjectSlug, Record<Environment, string[]>> = {
  app: {
    local: ["http://localhost:3000"],
    dev: ["https://app-testnet.treasure.lol"],
    prod: ["https://app.treasure.lol"],
  },
  zeeverse: {
    local: ["http://localhost:5174"],
    dev: ["https://tdk-examples-harvester.vercel.app"],
    prod: ["https://play.zee-verse.com"],
  },
};

const CALL_TARGETS: Record<ProjectSlug, Contract[]> = {
  app: [],
  zeeverse: ["MAGIC", "Consumables", "HarvesterEmerion", "NftHandlerEmerion"],
};

const prisma = new PrismaClient();

const createProject = ({
  slug,
  name,
  redirectUris = [],
  callTargets = [],
}: {
  slug: string;
  name: string;
  redirectUris?: string[];
  callTargets?: Contract[];
}) => {
  const data = {
    slug,
    name,
    redirectUris,
    callTargets: {
      connectOrCreate: callTargets.flatMap((contract) => {
        const testnetCallTarget = {
          chainId: arbitrumSepolia.id,
          address: getContractAddress(arbitrumSepolia.id, contract),
        };

        const mainnetCallTarget = {
          chainId: arbitrum.id,
          address: getContractAddress(arbitrum.id, contract),
        };

        return [
          {
            where: {
              chainId_address: testnetCallTarget,
            },
            create: testnetCallTarget,
          },
          {
            where: {
              chainId_address: mainnetCallTarget,
            },
            create: mainnetCallTarget,
          },
        ];
      }),
    },
  } as const;
  return prisma.project.upsert({
    where: { slug },
    create: data,
    update: data,
  });
};

(async () => {
  const args = process.argv.slice(2);
  const environment = (args[0] as Environment) ?? "local";

  try {
    for (const slug of PROJECT_SLUGS) {
      await createProject({
        slug,
        name: NAMES[slug],
        redirectUris: REDIRECT_URIS[slug][environment],
        callTargets: CALL_TARGETS[slug],
      });
    }

    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
})();

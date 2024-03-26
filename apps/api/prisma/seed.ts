import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import {
  type Contract,
  PROJECT_SLUGS,
  type ProjectSlug,
  getContractAddress,
} from "@treasure-dev/tdk-core";
import { arbitrum, arbitrumSepolia } from "viem/chains";

type Environment = "local" | "dev" | "prod";

type ProjectMetadata = Omit<Prisma.ProjectCreateInput, "slug">;

const METADATA: Record<ProjectSlug, ProjectMetadata> = {
  app: {
    name: "Treasure",
  },
  zeeverse: {
    name: "Zeeverse",
    cover: "https://images.treasure.lol/tdk/login/zeeverse_cover.png",
    color: "#8fd24f",
    customAuth: true,
  },
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
  zeeverse: [
    "MAGIC",
    "Consumables",
    "HarvesterEmberwing",
    "NftHandlerEmberwing",
  ],
};

const prisma = new PrismaClient();

const createProject = ({
  slug,
  metadata,
  redirectUris = [],
  callTargets = [],
}: {
  slug: string;
  metadata: ProjectMetadata;
  redirectUris?: string[];
  callTargets?: Contract[];
}) => {
  const data = {
    ...metadata,
    slug,
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
        metadata: METADATA[slug],
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

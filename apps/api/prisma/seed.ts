import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { type Contract, getContractAddress } from "@treasure-dev/tdk-core";
import { arbitrum, arbitrumSepolia, sepolia } from "viem/chains";

type Environment = "local" | "dev" | "prod";

type ProjectMetadata = Omit<Prisma.ProjectCreateInput, "slug">;

const METADATA: Record<string, ProjectMetadata> = {
  app: {
    name: "Treasure",
  },
  realm: {
    name: "Realm",
  },
  zeeverse: {
    name: "Zeeverse",
    cover: "https://images.treasure.lol/tdk/login/zeeverse_cover.png",
    icon: "https://images.treasure.lol/tdk/login/zeeverse_icon.png",
    color: "#8fd24f",
  },
};

const REDIRECT_URIS: Record<string, Record<Environment, string[]>> = {
  app: {
    local: ["http://localhost:3000"],
    dev: ["https://app-testnet.treasure.lol"],
    prod: ["https://app.treasure.lol"],
  },
  realm: {
    local: ["http://localhost:3000"],
    dev: ["https://app-testnet.treasure.lol"],
    prod: ["https://app.treasure.lol"],
  },
  zeeverse: {
    local: [
      "http://localhost:5174",
      "http://localhost:3000/harvesters/zeeverse",
    ],
    dev: [
      "https://tdk-examples-harvester.vercel.app",
      "https://bridgeworld-staging.treasure.lol/harvesters/zeeverse",
    ],
    prod: ["https://bridgeworld.treasure.lol/harvesters/zeeverse"],
  },
};

const CALL_TARGETS: Record<string, [number, Contract][]> = {
  app: [
    [arbitrumSepolia.id, "MAGIC"],
    [sepolia.id, "MAGIC"],
  ],
  realm: [[arbitrumSepolia.id, "MAGIC"]],
  zeeverse: [
    [arbitrumSepolia.id, "MAGIC"],
    [arbitrumSepolia.id, "Consumables"],
    [arbitrumSepolia.id, "Legions"],
    [arbitrumSepolia.id, "CorruptionRemoval"],
    [arbitrumSepolia.id, "ERC1155TokenSetCorruptionHandler"],
    [arbitrumSepolia.id, "HarvesterEmberwing"],
    [arbitrumSepolia.id, "NftHandlerEmberwing"],
    [arbitrumSepolia.id, "ZeeverseZee"],
    [arbitrumSepolia.id, "ZeeverseItems"],
    [arbitrumSepolia.id, "BulkTransferHelper"],
    [arbitrum.id, "MAGIC"],
    [arbitrum.id, "Consumables"],
    [arbitrum.id, "Legions"],
    [arbitrum.id, "CorruptionRemoval"],
    [arbitrum.id, "ERC1155TokenSetCorruptionHandler"],
    [arbitrum.id, "HarvesterEmberwing"],
    [arbitrum.id, "NftHandlerEmberwing"],
    [arbitrum.id, "ZeeverseZee"],
    [arbitrum.id, "ZeeverseItems"],
    [arbitrum.id, "BulkTransferHelper"],
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
  callTargets?: [number, Contract][];
}) => {
  const data = {
    ...metadata,
    slug,
    redirectUris,
    callTargets: {
      connectOrCreate: callTargets.map(([chainId, contract]) => {
        const address = getContractAddress(chainId, contract);
        if (!address) {
          throw new Error(
            `Contract address not found for ${contract} on chain ${chainId}`,
          );
        }

        const callTarget = { chainId, address };
        return {
          where: {
            chainId_address: callTarget,
          },
          create: callTarget,
        };
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
    for (const slug of Object.keys(METADATA)) {
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

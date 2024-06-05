import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import {
  type Contract,
  getContractAddress,
  treasureRuby,
} from "@treasure-dev/tdk-core";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "viem/chains";

type RemoteEnvironment = "dev" | "prod";
type Environment = "local" | RemoteEnvironment;
type ProjectMetadata = Omit<Prisma.ProjectCreateInput, "slug">;

const PROJECT_DATA: Record<
  string,
  {
    metadata: ProjectMetadata;
    redirectUris: Record<Environment, string[]>;
    callTargets: Record<RemoteEnvironment, [number, Contract][]>;
  }
> = {
  app: {
    metadata: {
      name: "Treasure",
    },
    redirectUris: {
      local: ["http://localhost:3000", "http://localhost:5174"],
      dev: ["https://app-testnet.treasure.lol"],
      prod: ["https://app.treasure.lol"],
    },
    callTargets: {
      dev: [[treasureRuby.id, "RubyNFT"]],
      prod: [],
    },
  },
  bitmates: {
    metadata: {
      name: "Bitmates",
    },
    redirectUris: {
      local: [],
      dev: [],
      prod: [],
    },
    callTargets: {
      dev: [],
      prod: [],
    },
  },
  harness: {
    metadata: {
      name: "TDK Harness",
    },
    redirectUris: {
      local: [],
      dev: [],
      prod: [],
    },
    callTargets: {
      dev: [
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
        [sepolia.id, "MAGIC"],
      ],
      prod: [],
    },
  },
  realm: {
    metadata: {
      name: "Realm",
    },
    redirectUris: {
      local: [],
      dev: [],
      prod: [],
    },
    callTargets: {
      dev: [],
      prod: [],
    },
  },
  smolbound: {
    metadata: {
      name: "Smolbound",
      icon: "https://images.treasure.lol/tdk/login/smolbound_icon.png",
    },
    redirectUris: {
      local: [],
      dev: [],
      prod: [],
    },
    callTargets: {
      dev: [],
      prod: [],
    },
  },
  zeeverse: {
    metadata: {
      name: "Zeeverse",
      icon: "https://images.treasure.lol/tdk/login/zeeverse_icon.png",
    },
    redirectUris: {
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
    callTargets: {
      dev: [
        [arbitrumSepolia.id, "MAGIC"],
        [arbitrumSepolia.id, "VEE"],
        [arbitrumSepolia.id, "Consumables"],
        [arbitrumSepolia.id, "Legions"],
        [arbitrumSepolia.id, "CorruptionRemoval"],
        [arbitrumSepolia.id, "ERC1155TokenSetCorruptionHandler"],
        [arbitrumSepolia.id, "HarvesterEmberwing"],
        [arbitrumSepolia.id, "NftHandlerEmberwing"],
        [arbitrumSepolia.id, "ZeeverseZee"],
        [arbitrumSepolia.id, "ZeeverseItems"],
        [arbitrumSepolia.id, "ZeeverseVeeClaimer"],
        [arbitrumSepolia.id, "BulkTransferHelper"],
        [arbitrumSepolia.id, "ZeeverseGame"],
        [sepolia.id, "CRV"],
        [sepolia.id, "VEE"],
        [sepolia.id, "ZeeverseLlama"],
        [sepolia.id, "ZeeverseLlamaEvolve"],
      ],
      prod: [
        [arbitrum.id, "MAGIC"],
        [arbitrum.id, "VEE"],
        [arbitrum.id, "Consumables"],
        [arbitrum.id, "Legions"],
        [arbitrum.id, "CorruptionRemoval"],
        [arbitrum.id, "ERC1155TokenSetCorruptionHandler"],
        [arbitrum.id, "HarvesterEmberwing"],
        [arbitrum.id, "NftHandlerEmberwing"],
        [arbitrum.id, "ZeeverseZee"],
        [arbitrum.id, "ZeeverseItems"],
        [arbitrum.id, "ZeeverseVeeClaimer"],
        [arbitrum.id, "BulkTransferHelper"],
        [mainnet.id, "CRV"],
        [mainnet.id, "ZeeverseLlama"],
        [mainnet.id, "ZeeverseLlamaEvolve"],
      ],
    },
  },
};

const prisma = new PrismaClient();

const createProject = async ({
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

        return {
          where: {
            chainId_address: { chainId, address },
          },
          create: { chainId, address },
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
    // Clear all call targets
    await prisma.callTarget.deleteMany();

    // Upsert projects
    for (const [
      slug,
      { metadata, redirectUris, callTargets },
    ] of Object.entries(PROJECT_DATA)) {
      await createProject({
        slug,
        metadata,
        redirectUris: redirectUris[environment],
        callTargets: callTargets[environment === "local" ? "dev" : environment],
      });
    }

    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
})();

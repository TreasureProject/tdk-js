import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import {
  type Contract,
  getContractAddress,
  treasureRuby,
} from "@treasure-dev/tdk-core";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "thirdweb/chains";

type RemoteEnvironment = "dev" | "prod";
type Environment = "local" | RemoteEnvironment;
type ProjectMetadata = Omit<Prisma.ProjectCreateInput, "slug">;

const PROJECT_DATA: Record<
  string,
  {
    metadata: ProjectMetadata;
    callTargets: Record<RemoteEnvironment, [number, Contract | string][]>;
  }
> = {
  "aliyas-ascent": {
    metadata: {
      name: "Aliya's Ascent",
    },
    callTargets: {
      dev: [],
      prod: [],
    },
  },
  app: {
    metadata: {
      name: "Treasure",
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
    callTargets: {
      dev: [],
      prod: [],
    },
  },
  harness: {
    metadata: {
      name: "TDK Harness",
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
        [arbitrumSepolia.id, "MagicswapV2Router"],
        [arbitrumSepolia.id, "Treasures"],
        [sepolia.id, "MAGIC"],
      ],
      prod: [],
    },
  },
  realm: {
    metadata: {
      name: "Realm",
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
        [arbitrumSepolia.id, "MagicswapV2Router"],
        [arbitrumSepolia.id, "0x77d3d38ef24a2179b5147d8ebdab84b26012b210"],
        [arbitrumSepolia.id, "0xb839c8f68415df2ae57d5e84f180afeeff451d28"],
        [arbitrumSepolia.id, "0x659e2056746a948b89849e2a8260b9b40547fc1e"],
        [arbitrumSepolia.id, "0x8ea8f2fa60defce91d454b1586b0eef02c39e452"],
        [arbitrumSepolia.id, "0x9fe0776da91daff09c71f848fe70c28e9ff04938"],
        [arbitrumSepolia.id, "0xeb4aab0253a50918a2cbb7adbaab78ad19c07bb1"],
        [arbitrumSepolia.id, "0x5cd757ef714b530a3cdfcb4573bcbb091d2a8f47"],
        [arbitrumSepolia.id, "0x0cab0aacad409e31edced970b6cb2866bbd87985"],
        [arbitrumSepolia.id, "0x7060bf4718e3aa65469b05e704eae3d1ac92d889"],
        [arbitrumSepolia.id, "0xcd6a505c76ff60450df8461ca2e7cae1cc25dfa8"],
        [arbitrumSepolia.id, "0xcc3682db930bd6be6163b4faeb6c4bd57942fd22"],
        [arbitrumSepolia.id, "0xfdff26af67f6e06a9806bf070e4285cfb000406c"],
        [arbitrumSepolia.id, "0x512a5beb48b1aff4ef2b776a44232f93d2958973"],
        [arbitrumSepolia.id, "0xcd309f983906abba616f279b3c8dc3473cb05e66"],
        [arbitrumSepolia.id, "0x5dba7124c8189018ab3185f726d22a15217a1155"],
        [arbitrumSepolia.id, "0x855fc1a6f250fce69371dc280e9f12a9d44c2dba"],
        [arbitrumSepolia.id, "0xd3fca189b66b5e880040f61050b4431d1c428efe"],
        [arbitrumSepolia.id, "0x7f5bbc6a35150fc9c1716b66776fb664307295e8"],
        [arbitrumSepolia.id, "0x68a0dc480abb5228e0d3ac6764c834ad5c88121a"],
        [arbitrumSepolia.id, "0xf3a50c9ade296567f3b5a89d4659bcf0effd44f6"],
        [arbitrumSepolia.id, "0x056dc78f505ad2d4ea306761d039be318bc92cd4"],
        [arbitrumSepolia.id, "0x5a3247e764ee0e71cef22802d189815fad6f1257"],
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
        [arbitrum.id, "ZeeverseGame"],
        [arbitrum.id, "MagicswapV2Router"],
        [arbitrum.id, "0xb8ba7616d90d2a319211514d499a9e0c0ddb4716"],
        [arbitrum.id, "0x3f72f45130d0e3560e694e67cf32de8d3413e47d"],
        [arbitrum.id, "0x95a13c0cde16a1843faa81d5e7783abcc556050a"],
        [arbitrum.id, "0x50046ee6a01a7c877aa57e74eb3ab227a6c00b02"],
        [arbitrum.id, "0x83bc97eb3979600c8e0e84e9203967a2b71ed58d"],
        [arbitrum.id, "0x36319d18c07d79a19ad3db8a78098ac2ca1b1250"],
        [arbitrum.id, "0x8f44533d2a4eeda0fee05b5a03befafddc91d06f"],
        [arbitrum.id, "0x1e81afe5659e8e869c9a7cb93ea865882bda5030"],
        [arbitrum.id, "0xef8e8611d5333555a8dc3ee72524942cd2a0dfe3"],
        [arbitrum.id, "0x160e15c3ba69a124a4c847f35a2f53046ba716c5"],
        [arbitrum.id, "0x1d0fa29ba3f883f60177ccf90797196816c43770"],
        [arbitrum.id, "0x963eacccbce74c761ce35b5d38760c3bbd40edf5"],
        [arbitrum.id, "0x87e6db0db595c76ef5ed59f81bab19b0157cf300"],
        [arbitrum.id, "0x1f41b56460658a3a07239d9babe8cf9073fc0784"],
        [arbitrum.id, "0x5afaa09bfa3f8f78cebcbffaa4428780d06b06e5"],
        [arbitrum.id, "0x8f37db83fe482194b72309d144d996697ddaa5b3"],
        [arbitrum.id, "0x0a32100989e290d49cb550026158c7cea2eee445"],
        [arbitrum.id, "0x31496de3e78484bc0c30b92249f9b1aaebdc1ff5"],
        [arbitrum.id, "0x5f04e5d409c5bd1b1545619931d3713f68e448d2"],
        [arbitrum.id, "0x74abf11b5f7bf057000e411a7130b46911792709"],
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
  callTargets = [],
}: {
  slug: string;
  metadata: ProjectMetadata;
  callTargets?: [number, Contract | string][];
}) => {
  const data = {
    ...metadata,
    slug,
    callTargets: {
      connectOrCreate: callTargets.map(([chainId, contract]) => {
        const address = contract.startsWith("0x")
          ? contract
          : getContractAddress(chainId, contract as Contract);
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
    for (const [slug, { metadata, callTargets }] of Object.entries(
      PROJECT_DATA,
    )) {
      await createProject({
        slug,
        metadata,
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

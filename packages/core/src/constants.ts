import { defineChain } from "thirdweb";
import {
  abstract,
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  sepolia,
} from "thirdweb/chains";

import type { AddressString, Contract } from "./types";

// Default values
export const DEFAULT_TDK_API_BASE_URI = "https://tdk-api.treasure.lol";
export const DEFAULT_TDK_APP = "app";
export const DEFAULT_TDK_CHAIN_ID = arbitrum.id;
export const DEFAULT_TDK_APP_NAME = "App";
export const DEFAULT_TDK_APP_ICON_URI =
  "https://images.treasure.lol/tdk/login/treasure_icon.png";
export const DEFAULT_TDK_ECOSYSTEM_ID = "ecosystem.treasure";
export const DEFAULT_TDK_DARKMATTER_BASE_URI =
  "https://darkmatter.spellcaster.lol";

// Chains
export const TREASURE_TOPAZ_CHAIN_DEFINITION = {
  id: 978658,
  name: "Treasure Topaz",
  nativeCurrency: {
    name: "MAGIC",
    symbol: "MAGIC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.topaz.treasure.lol"],
    },
  },
  blockExplorers: {
    default: {
      name: "Treasure Topaz Explorer",
      url: "https://topaz.treasurescan.io",
      apiUrl: "https://topaz.treasurescan.io/node-api/proxy/api/v2",
    },
  },
  testnet: true,
};
export const treasureTopaz = defineChain(TREASURE_TOPAZ_CHAIN_DEFINITION);

export const TREASURE_CHAIN_DEFINITION = {
  id: 61166,
  name: "Treasure",
  nativeCurrency: {
    name: "MAGIC",
    symbol: "MAGIC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.treasure.lol"],
    },
  },
  blockExplorers: {
    default: {
      name: "Treasure Explorer",
      url: "https://treasurescan.io",
      apiUrl: "https://treasurescan.io/api/v2",
    },
  },
};
export const treasure = defineChain(TREASURE_CHAIN_DEFINITION);

// APIs
export const BRIDGEWORLD_API_URL = {
  [arbitrum.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/bridgeworld/live/gn",
  [arbitrumSepolia.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/bridgeworld-dev/live/gn",
} as const;

export const MAGICSWAPV2_API_URL = {
  [abstract.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/magicswap-abstract/live/gn",
  [arbitrum.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/magicswapv2/live/gn",
  [arbitrumSepolia.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/magicswapv2-dev/live/gn",
  [base.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/magicswap-base/live/gn",
  [baseSepolia.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/magicswap-dev-base-sepolia/live/gn",
  [treasure.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/magicswap-treasure/live/gn",
  [treasureTopaz.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/magicswap-dev-topaz/live/gn",
  [sepolia.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/magicswap-dev-sepolia/live/gn",
} as const;

// Tokens
export const TOKEN_IDS = {
  Consumables: {
    SmallMetabolicBooster: 4n,
    MediumMetabolicBooster: 5n,
    LargeMetabolicBooster: 6n,
    DurableBooster: 19n,
    AnabolicBooster: 20n,
    OverclockedBooster: 21n,
  },
} as const;

// Contracts
export const CONTRACT_ADDRESSES: Record<
  number,
  Partial<Record<Contract, AddressString>>
> = {
  [arbitrum.id]: {
    // Tokens
    MAGIC: "0x539bde0d7dbd336b79148aa742883198bbf60342",
    VEE: "0x0caadd427a6feb5b5fc1137eb05aa7ddd9c08ce9",
    // Bridgeworld
    Middleman: "0x3ea9ceaebdeb702fcbc576710084c464431584c8",
    BalancerCrystals: "0xbfeba04384cecfaf0240b49163ed418f82e43d3a",
    Consumables: "0xf3d00a2559d84de7ac093443bcaada5f4ee4165c",
    Legions: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1",
    Treasures: "0xebba467ecb6b21239178033189ceae27ca12eadf",
    // Magicswap
    MagicswapV2Router: "0xf7c8f888720d5af7c54dfc04afe876673d7f5f43",
    // Treasure Misc
    BulkTransferHelper: "0x0000000000c2d145a2526bd8c716263bfebe1a72",
    TreasureConduit: "0x8bf85fa9213647ec3485afd9dd5888b4db017434",
    TreasureBanners: "0x100cdab97f2a8a0e0f0311ba6f6d08592136472e",
  },
  [arbitrumSepolia.id]: {
    // Tokens
    MAGIC: "0x55d0cf68a1afe0932aff6f36c87efa703508191c",
    VEE: "0x23be0504127475387a459fe4b01e54f1e336ffae",
    // Bridgeworld
    Middleman: "0x81ece9e2a45e5c4c563316dae125e9dce2fa0d4b",
    BalancerCrystals: "0x43499c6926bcc78d3ad73fed6627de75c45c5878",
    Consumables: "0x9d012712d24c90dded4574430b9e6065183896be",
    Legions: "0xd144e34c3c0a8e605e9d45792380841a2169dd8f",
    Treasures: "0xfe592736200d7545981397ca7a8e896ac0c166d4",
    // Magicswap
    MagicswapV2Router: "0xa8654a8097b78daf740c1e2ada8a6bf3cd60da50",
    // Treasure Misc
    BulkTransferHelper: "0x0000000000c2d145a2526bd8c716263bfebe1a72",
    TreasureConduit: "0x74c4ed7e3bcbdf8e32b56d4d11d2cbd34ad4dc0b",
    TreasureBanners: "0x023083def4855918dea65f1dea351fcdabb1e073",
  },
  [mainnet.id]: {
    // Tokens
    MAGIC: "0xb0c7a3ba49c7a6eaba6cd4a96c55a1391070ac9a",
    CRV: "0xD533a949740bb3306d119CC777fa900bA034cd52",
  },
  [sepolia.id]: {
    // Tokens
    MAGIC: "0x013cb2854daad8203c6686682f5d876e5d3de4a2",
    VEE: "0x3398ddf47c19f20e7d048727ea7989e0a71d8cde",
  },
  [treasureTopaz.id]: {
    // Magicswap
    MagicswapV2Router: "0xad781ed13b5966e7c620b896b6340abb4dd2ca86",
    // Treasure Misc
    TopazNFT: "0x0df42db01ff1992fbd2acff3b7a9010cf59b6f80",
  },
  [base.id]: {
    // Magicswap
    MagicswapV2Router: "0xb740D5804eA2061432469119cfa40cbb4586dd17",
  },
  [baseSepolia.id]: {
    // Magicswap
    MagicswapV2Router: "0x4043b1c99838945555341c0d5e101e75f143a660",
  },
  [abstract.id]: {
    // Magicswap
    MagicswapV2Router: "0x3193b4e0e6c0417682f5916c26138ee86917efa1",
  },
};

export const TREASURE_CONDUIT_KEYS: Record<number, AddressString> = {
  [arbitrum.id]:
    "0x086a11794a945fb10a6199cca4e0d7ff6d25513b000000000000000000000001",
  [arbitrumSepolia.id]:
    "0xc51f27cf93531be66671dd0543cf22b475d00873000000000000000000000001",
};

export const ACCOUNT_FACTORY_ADDRESS =
  "0x463effb51873c7720c810ac7fb2e145ec2f8cc60";

export const USER_PROFILE_FREE_BANNER_URLS = {
  ruby: "https://images.treasure.lol/0/ProfileBanner2/Treasure_Ruby.png",
  honey: "https://images.treasure.lol/0/ProfileBanner2/Treasure_Honey.png",
  sapphire:
    "https://images.treasure.lol/0/ProfileBanner2/Treasure_Sapphire.png",
};

import { ZERO_ADDRESS, defineChain } from "thirdweb";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "thirdweb/chains";

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
  id: 978_658,
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
      name: "Treasurescan",
      url: "https://topaz.treasurescan.io",
      apiUrl: "https://block-explorer.topaz.treasurescan.io/api",
    },
  },
  testnet: true,
};
export const treasureTopaz = defineChain(TREASURE_TOPAZ_CHAIN_DEFINITION);

// APIs
export const BRIDGEWORLD_API_URL = {
  [arbitrum.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/bridgeworld/live/gn",
  [arbitrumSepolia.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/bridgeworld-dev/live/gn",
} as const;

export const MAGICSWAPV2_API_URL = {
  [arbitrum.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/magicswapv2/live/gn",
  [arbitrumSepolia.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/magicswapv2-dev/live/gn",
  [treasureTopaz.id]:
    "https://api.goldsky.com/api/public/project_clrm53zqegpoi01x18coz2fb5/subgraphs/magicswap-dev-topaz/live/gn",
} as const;

// Tokens
export const TOKEN_IDS = {
  Consumables: {
    SmallPrism: 1n,
    MediumPrism: 2n,
    LargePrism: 3n,
    SmallMetabolicBooster: 4n,
    MediumMetabolicBooster: 5n,
    LargeMetabolicBooster: 6n,
    BridgeworldAncientPermit: 7n,
    EssenceOfStarlight: 8n,
    PrismShards: 9n,
    UniversalLock: 10n,
    AzuriteDust: 11n,
    EssenceOfHoneycomb: 12n,
    EssenceOfGrin: 13,
    ShroudedTesseract: 14n,
    MalevolentPrism: 15n,
    AtlasMineAncientPermit: 16n,
    KnightsOfTheEtherAncientPermit: 17n,
    BeaconAncientPermit: 18n,
    DurableBooster: 19n,
    AnabolicBooster: 20n,
    OverclockedBooster: 21n,
    ZeeverseAncientPermit: 22n,
  },
  Treasures: {
    AncientRelic: 39n,
    BagOfRareMushrooms: 46n,
    BaitForMonsters: 47n,
    BeetleWings: 48n,
    BlueRupee: 49n,
    BottomlessElixir: 51n,
    CapOfInvisibility: 52n,
    Carriage: 53n,
    Castle: 54n,
    CommonBead: 68n,
    CommonFeather: 69n,
    CommonRelic: 71n,
    Cow: 72n,
    Diamond: 73n,
    DivineHourglass: 74n,
    DivineMask: 75n,
    Donkey: 76n,
    DragonTail: 77n,
    Emerald: 79n,
    FavorFromTheGods: 82n,
    FramedButterfly: 91n,
    GoldCoin: 92n,
    Grain: 93n,
    GreenRupee: 94n,
    Grin: 95n,
    HalfPenny: 96n,
    Honeycomb: 97n,
    ImmovableStone: 98n,
    IvoryBreastpin: 99n,
    JarOfFairies: 100n,
    Lumber: 103n,
    MilitaryStipend: 104n,
    MolluskShell: 105n,
    Ox: 114n,
    Pearl: 115n,
    PotOfGold: 116n,
    QuarterPenny: 117n,
    RedFeather: 132n,
    RedRupee: 133n,
    ScoreOfIvory: 141n,
    SilverCoin: 151n,
    SmallBird: 152n,
    SnowWhiteFeather: 153n,
    ThreadOfDivineSilk: 161n,
    UnbreakablePocketwatch: 162n,
    WitchesBroom: 164n,
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
    ARB: "0x912ce59144191c1204e64559fe8253a0e49e6548",
    VEE: "0x0caadd427a6feb5b5fc1137eb05aa7ddd9c08ce9",
    // Bridgeworld
    Middleman: "0x3ea9ceaebdeb702fcbc576710084c464431584c8",
    BalancerCrystals: "0xbfeba04384cecfaf0240b49163ed418f82e43d3a",
    Consumables: "0xf3d00a2559d84de7ac093443bcaada5f4ee4165c",
    Legions: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1",
    Treasures: "0xebba467ecb6b21239178033189ceae27ca12eadf",
    HarvesterAfarit: "0x70a75ac9537f6cdac553f82b6e39484acc521067",
    NftHandlerAfarit: "0x5aa865ac69f481d43a7c67cde7d20781733eb612",
    HarvesterAsiterra: "0x88bf661446c8f5a7072c0f75193dae0e18ae40bc",
    NftHandlerAsiterra: "0x2ef99434b0be1511ed2a1589dc987e48298e059e",
    HarvesterEmberwing: "0x36882e71d11eadd9f869b0fd70d18d5045939986",
    NftHandlerEmberwing: "0x22cafc3819a35cddbdafb6417db5e8fcd5ca49e7",
    HarvesterEmerion: "0x587dc30014e10b56907237d4880a9bf8b9518150",
    NftHandlerEmerion: "0x02d1922d34724a09eb1533b6276fb7e4775a1b37",
    HarvesterKameji: "0xdf9f9ca6ee5c3024b64dcecbadc462c0b896147a",
    NftHandlerKameji: "0xa0515709fa0f520241659a91d868151e1ad263d8",
    HarvesterLupusMagus: "0x3fbfcdc02f649d5875bc9f97281b7ef5a7a9c491",
    NftHandlerLupusMagus: "0x0c73a18364850239571afca78dd5d39193f288be",
    HarvesterShinoba: "0x2b1de6d22e6cb9178b3ecbcb7f20b62fcce925d4",
    NftHandlerShinoba: "0x85f1bfd98e190b482d5348fd6c987ae3da7a4df6",
    HarvesterThundermane: "0x3fbfcdc02f649d5875bc9f97281b7ef5a7a9c491",
    NftHandlerThundermane: "0x0c73a18364850239571afca78dd5d39193f288be",
    // Magicswap
    MagicswapV2Router: "0xf7c8f888720d5af7c54dfc04afe876673d7f5f43",
    // Treasure Misc
    ManagedAccountFactory: "0x463effb51873c7720c810ac7fb2e145ec2f8cc60",
    BulkTransferHelper: "0x0000000000c2d145a2526bd8c716263bfebe1a72",
    TreasureConduit: "0x8bf85fa9213647ec3485afd9dd5888b4db017434",
    // Zeeverse
    ZeeverseZee: "0x094fa8ae08426ab180e71e60fa253b079e13b9fe",
    ZeeverseItems: "0x58318bceaa0d249b62fad57d134da7475e551b47",
    ZeeverseVeeClaimer: "0x1cebdde81a9e4cd377bc7da5000797407cf9a58a",
    ZeeverseGame: "0x9b85e59d6e4295fdeb8f82fd5d9ecafbd3f6d5d8",
  },
  [arbitrumSepolia.id]: {
    // Tokens
    MAGIC: "0x55d0cf68a1afe0932aff6f36c87efa703508191c",
    ARB: ZERO_ADDRESS,
    VEE: "0x23be0504127475387a459fe4b01e54f1e336ffae",
    // Bridgeworld
    Middleman: "0x81ece9e2a45e5c4c563316dae125e9dce2fa0d4b",
    BalancerCrystals: "0x43499c6926bcc78d3ad73fed6627de75c45c5878",
    Consumables: "0x9d012712d24c90dded4574430b9e6065183896be",
    Legions: "0xd144e34c3c0a8e605e9d45792380841a2169dd8f",
    Treasures: "0xfe592736200d7545981397ca7a8e896ac0c166d4",
    HarvesterAfarit: "0x1fe108cc61b293c92a174e9339bbe6d12fc2e4d9",
    NftHandlerAfarit: "0xc57fbc64a6314ae431900fe8ae105a5d45aa27d4",
    HarvesterAsiterra: "0xb1645ae4ce2bbf345706a43647a3a9dc8f3ac69b",
    NftHandlerAsiterra: "0x01604018de9c87de330274f70eac727d0b4e0163",
    HarvesterEmberwing: "0x816c0717cf263e7da4cd33d4979ad15dbb70f122",
    NftHandlerEmberwing: "0x94c64b689336b3f0388503cc1cb4a193520dff73",
    HarvesterEmerion: "0x466d20a94e280bb419031161a6a7508438ad436f",
    NftHandlerEmerion: "0xff1e4795433e12816cb3b3f6342af02e8b942ffb",
    HarvesterKameji: "0xb433147b69663fcd9a000a32fc5d0eef9505ff7c",
    NftHandlerKameji: "0x5c4aa6ad08dcddc6b2a1fff0ee0997e51fa826e1",
    HarvesterLupusMagus: "0x413bf05048ef9953a94538a5b2c7ae86f41e531b",
    NftHandlerLupusMagus: "0xb9fbc2b364e9dbe61b3c083fcb2f85fc4520b25d",
    HarvesterShinoba: "0x97fd6e4436d19ddb723ebe383ba57673361c4d31",
    NftHandlerShinoba: "0x9fc401504a8bac2f8c1a6d4f9a9e81999570dcbf",
    HarvesterThundermane: "0x347471fbfc6daceed66a09c38e9596cd1706da46",
    NftHandlerThundermane: "0x00a191804f5bc4942828ae8cde937a4b644d53cf",
    // Magicswap
    MagicswapV2Router: "0xa8654a8097b78daf740c1e2ada8a6bf3cd60da50",
    // Treasure Misc
    ManagedAccountFactory: "0x463effb51873c7720c810ac7fb2e145ec2f8cc60",
    BulkTransferHelper: "0x0000000000c2d145a2526bd8c716263bfebe1a72",
    TreasureConduit: "0x74c4ed7e3bcbdf8e32b56d4d11d2cbd34ad4dc0b",
    // Zeeverse
    ZeeverseZee: "0xb1af672c7e0e8880c066ecc24930a12ff2ee8534",
    ZeeverseItems: "0xfaad5aa3209ab1b25ede22ed4da5521538b649fa",
    ZeeverseVeeClaimer: "0xf7abce65b1e683b7a42113f69ef76ee35cabbddc",
    ZeeverseGame: "0x695f9a040f19e3d31c15c39ccb853ef0604896ca",
  },
  [mainnet.id]: {
    // Tokens
    CRV: "0xd533a949740bb3306d119cc777fa900ba034cd52",
    // Treasure Misc
    ManagedAccountFactory: "0x463effb51873c7720c810ac7fb2e145ec2f8cc60",
    // Zeeverse
    ZeeverseLlama: "0xba955e13208d877f2cf8f2f21dd200bf795063a1",
    ZeeverseLlamaEvolve: "0xa8f6f8a7225cf735851acc417e29cc2d1b092dc4",
  },
  [sepolia.id]: {
    // Tokens
    MAGIC: "0x013cb2854daad8203c6686682f5d876e5d3de4a2",
    VEE: "0x3398ddf47c19f20e7d048727ea7989e0a71d8cde",
    CRV: "0x5cd16a4b0e4c33445fdbb4ba145c13d4c1ad711f",
    // Treasure Misc
    ManagedAccountFactory: "0x463effb51873c7720c810ac7fb2e145ec2f8cc60",
    // Zeeverse
    ZeeverseLlama: "0xd60a53b298a468d2aa3880614b3ebd4515814fc6",
    ZeeverseLlamaEvolve: "0xa8f6f8a7225cf735851acc417e29cc2d1b092dc4",
  },
  [treasureTopaz.id]: {
    // Magicswap
    MagicswapV2Router: "0xad781ed13b5966e7c620b896b6340abb4dd2ca86",
    // Treasure Misc
    TopazNFT: "0x0df42db01ff1992fbd2acff3b7a9010cf59b6f80",
  },
};

export const TREASURE_CONDUIT_KEYS: Record<number, AddressString> = {
  [arbitrum.id]:
    "0x086a11794a945fb10a6199cca4e0d7ff6d25513b000000000000000000000001",
  [arbitrumSepolia.id]:
    "0xc51f27cf93531be66671dd0543cf22b475d00873000000000000000000000001",
};

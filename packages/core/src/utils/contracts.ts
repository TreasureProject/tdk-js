import { zeroAddress } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";

import type {
  AddressString,
  Contract,
  PriceFeedContract,
  Token,
} from "../types";

export const CONTRACT_ADDRESSES: Record<
  number,
  Record<Contract, AddressString>
> = {
  [arbitrum.id]: {
    // Tokens
    MAGIC: "0x539bde0d7dbd336b79148aa742883198bbf60342",
    ARB: "0x912ce59144191c1204e64559fe8253a0e49e6548",
    // Price feeds
    MAGICUSDPriceFeed: "0x47e55ccec6582838e173f252d08afd8116c2202d",
    ARBUSDPriceFeed: "0xb2a824043730fe05f3da2efafa1cbbe83fa548d6",
    ETHUSDPriceFeed: "0x639fe6ab55c921f74e7fac1ee960c0b6293ba612",
    // Bridgeworld
    Consumables: "0xf3d00a2559d84de7ac093443bcaada5f4ee4165c",
    HarvesterAfarit: "0x70a75ac9537f6cdac553f82b6e39484acc521067",
    NftHandlerAfarit: "0x5aa865ac69f481d43a7c67cde7d20781733eb612",
    HarvesterAsiterra: "0x88bf661446c8f5a7072c0f75193dae0e18ae40bc",
    NftHandlerAsiterra: "0x2ef99434b0be1511ed2a1589dc987e48298e059e",
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
    // Misc
    PaymentsModule: "0xf325ac5c9dc74a3c3b7f2474a709154e9f6bc194",
    TreasureLoginAccountFactory: zeroAddress,
  },
  [arbitrumSepolia.id]: {
    // Tokens
    MAGIC: "0x55d0cf68a1afe0932aff6f36c87efa703508191c",
    ARB: zeroAddress,
    // Price feeds
    MAGICUSDPriceFeed: "0x0fb99723aee6f420bead13e6bbb79b7e6f034298",
    ARBUSDPriceFeed: zeroAddress,
    ETHUSDPriceFeed: "0xd30e2101a97dcbaebcbc04f14c3f624e67a35165",
    // Bridgeworld
    Consumables: "0x9d012712d24c90dded4574430b9e6065183896be",
    HarvesterAfarit: "0x1fe108cc61b293c92a174e9339bbe6d12fc2e4d9",
    NftHandlerAfarit: "0xc57fbc64a6314ae431900fe8ae105a5d45aa27d4",
    HarvesterAsiterra: "0xb1645ae4ce2bbf345706a43647a3a9dc8f3ac69b",
    NftHandlerAsiterra: "0x01604018de9c87de330274f70eac727d0b4e0163",
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
    // Misc
    PaymentsModule: "0x06e308c2ed6168afd158a4b495b084e9677f4e1d",
    TreasureLoginAccountFactory: "0xfa9db4a45418688d14224b7782a44a8401f68be7",
  },
};

export const getContractAddresses = (chainId: number) => {
  const addresses = CONTRACT_ADDRESSES[chainId];
  return addresses ?? CONTRACT_ADDRESSES[arbitrum.id];
};

export const getContractAddress = (chainId: number, contract: Contract) =>
  getContractAddresses(chainId)[contract];

export const getTokenPriceFeedContract = (
  token: Token,
): PriceFeedContract | undefined => {
  switch (token) {
    case "MAGIC":
      return "MAGICUSDPriceFeed";
    case "ARB":
      return "ARBUSDPriceFeed";
    case "ETH":
      return "ETHUSDPriceFeed";
    default:
      return undefined;
  }
};

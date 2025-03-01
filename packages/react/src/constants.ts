import { getContractAddresses } from "@treasure-dev/tdk-core";
import {
  arbitrum,
  arbitrumSepolia,
  mainnet,
  sepolia,
  treasure,
  treasureTopaz,
} from "thirdweb/chains";
import { type SupportedTokens, darkTheme } from "thirdweb/react";

export const CONNECT_MODAL_THEME = darkTheme({
  colors: {
    modalBg: "#131D2E",
    modalOverlayBg: "rgba(0, 0, 0, 0.3)",
    borderColor: "#1F2D45",
    separatorLine: "#19253A",
    danger: "#DC2626",
    success: "#4AE387",
    accentText: "#586C8D",
    accentButtonBg: "#DC2626",
    accentButtonText: "#FFFCF5",
    primaryText: "#FFFCF5",
    primaryButtonText: "#131418",
    secondaryText: "#B7BABE",
    secondaryButtonBg: "#283852",
    secondaryIconColor: "#B7BABE",
    secondaryIconHoverColor: "#FFFCF5",
    secondaryIconHoverBg: "transparent",
    tertiaryBg: "#19253A",
    connectedButtonBg: "#131D2E",
    connectedButtonBgHover: "#283852",
  },
});

const ETH_TOKEN = {
  symbol: "ETH",
  name: "Ethereum",
  icon: "https://images.treasure.lol/tokens/eth.png",
};

const MAGIC_TOKEN = {
  symbol: "MAGIC",
  name: "MAGIC",
  icon: "https://images.treasure.lol/tokens/magic.png",
} as const;

const WMAGIC_TOKEN = {
  symbol: "WMAGIC",
  name: "Wrapped MAGIC",
  icon: "https://images.treasure.lol/tokens/wmagic.png",
} as const;

const VEE_TOKEN = {
  symbol: "VEE",
  name: "VEE",
  icon: "https://images.treasure.lol/tokens/vee.png",
};

const USDC_TOKEN = {
  symbol: "USDC",
  name: "USD Coin",
  icon: "https://images.treasure.lol/tokens/usdc.png",
};

const arbitrumContracts = getContractAddresses(arbitrum.id);
const arbitrumSepoliaContracts = getContractAddresses(arbitrumSepolia.id);
const mainnetContracts = getContractAddresses(mainnet.id);
const sepoliaContracts = getContractAddresses(sepolia.id);
const treasureContracts = getContractAddresses(treasure.id);
const treasureTopazContracts = getContractAddresses(treasureTopaz.id);

export const CONNECT_MODAL_SUPPORTED_TOKENS: SupportedTokens = {
  [arbitrum.id]: [
    {
      ...MAGIC_TOKEN,
      address: arbitrumContracts.MAGIC,
    },
    {
      symbol: "SMOL",
      name: "SMOL",
      icon: "https://images.treasure.lol/tokens/smol.png",
      address: arbitrumContracts.SMOL,
    },
    {
      ...VEE_TOKEN,
      address: arbitrumContracts.VEE,
    },
    {
      ...USDC_TOKEN,
      address: arbitrumContracts.USDC,
    },
  ],
  [arbitrumSepolia.id]: [
    {
      ...MAGIC_TOKEN,
      address: arbitrumSepoliaContracts.MAGIC,
    },
    {
      ...VEE_TOKEN,
      address: arbitrumSepoliaContracts.VEE,
    },
  ],
  [mainnet.id]: [
    {
      ...MAGIC_TOKEN,
      address: mainnetContracts.MAGIC,
    },
    {
      ...USDC_TOKEN,
      address: mainnetContracts.USDC,
    },
    {
      symbol: "CRV",
      name: "Curve DAO Token",
      icon: "https://etherscan.io/token/images/Curvefi_32.png",
      address: mainnetContracts.CRV,
    },
  ],
  [sepolia.id]: [
    {
      ...MAGIC_TOKEN,
      address: sepoliaContracts.MAGIC,
    },
    {
      ...VEE_TOKEN,
      address: sepoliaContracts.VEE,
    },
  ],
  [treasure.id]: [
    {
      ...WMAGIC_TOKEN,
      address: treasureContracts.WMAGIC,
    },
    {
      ...ETH_TOKEN,
      address: treasureContracts.ETH,
    },
    {
      symbol: "SMOL",
      name: "SMOL",
      icon: "https://images.treasure.lol/tokens/smolv2.png",
      address: treasureContracts.SMOL,
    },
  ],
  [treasureTopaz.id]: [
    {
      ...WMAGIC_TOKEN,
      address: treasureTopazContracts.WMAGIC,
    },
    {
      ...ETH_TOKEN,
      address: treasureTopazContracts.ETH,
    },
  ],
};

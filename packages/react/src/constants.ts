import { getContractAddresses } from "@treasure-dev/tdk-core";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "thirdweb/chains";
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

const MAGIC_TOKEN = {
  symbol: "MAGIC",
  name: "MAGIC",
  icon: "https://images.treasure.lol/tdk/login/magic.png",
} as const;

const VEE_TOKEN = {
  symbol: "VEE",
  name: "VEE",
  icon: "https://images.treasure.lol/tdk/login/vee.png",
};

const arbitrumContracts = getContractAddresses(arbitrum.id);
const arbitrumSepoliaContracts = getContractAddresses(arbitrumSepolia.id);
const mainnetContracts = getContractAddresses(mainnet.id);
const sepoliaContracts = getContractAddresses(sepolia.id);

export const CONNECT_MODAL_SUPPORTED_TOKENS: SupportedTokens = {
  [arbitrum.id]: [
    {
      ...MAGIC_TOKEN,
      address: arbitrumContracts.MAGIC,
    },
    {
      ...VEE_TOKEN,
      address: arbitrumContracts.VEE,
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
};

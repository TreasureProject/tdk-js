import {
  type SupportedTokens,
  darkTheme,
  useWalletDetailsModal,
} from "thirdweb/react";

import {
  getContractAddress,
  getContractAddresses,
} from "@treasure-dev/tdk-core";
import { ZERO_ADDRESS, defineChain } from "thirdweb";
import { arbitrum, arbitrumSepolia } from "thirdweb/chains";
import {
  ConnectModal,
  type Options as ConnectModalOptions,
  type Props as ConnectModalProps,
} from "../components/connect/ConnectModal";
import { useTreasure } from "../contexts/treasure";
import { getLocaleId } from "../i18n";

export type Options = ConnectModalOptions & {
  supportedChainIds?: number[];
  connectModalSize?: ConnectModalProps["size"];
  hideDisconnect?: boolean;
  hideSwitchWallet?: boolean;
};

type Props = Options;

const THEME = darkTheme({
  colors: {
    modalBg: "#131D2E",
    modalOverlayBg: "rgba(0, 0, 0, 0.3)",
    borderColor: "#172135",
    separatorLine: "#19253A",
    danger: "#DC2626",
    success: "#4AE387",
    accentText: "#FFFCF5",
    accentButtonBg: "#DC2626",
    accentButtonText: "#FFFCF5",
    primaryText: "#FFFCF5",
    primaryButtonText: "#131418",
    secondaryText: "#B7BABE",
    secondaryButtonBg: "#22232b",
    secondaryIconColor: "#B7BABE",
    secondaryIconHoverColor: "#FFFCF5",
    secondaryIconHoverBg: "transparent",
    tertiaryBg: "#19253A",
    connectedButtonBg: "#131D2E",
    connectedButtonBgHover: "#283852",
  },
});

const SUPPORTED_TOKENS = [
  {
    symbol: "MAGIC",
    name: "MAGIC",
    icon: "https://images.treasure.lol/tdk/login/magic.png",
  },
  {
    symbol: "VEE",
    name: "VEE",
    icon: "https://images.treasure.lol/tdk/login/vee.png",
  },
] as const;

export const useConnect = (props?: Props) => {
  const { chain, client, logOut, setRootElement } = useTreasure();
  const { open: openWalletDetailsModal } = useWalletDetailsModal();
  const {
    supportedChainIds,
    connectModalSize,
    hideDisconnect,
    hideSwitchWallet,
    ...connectModalProps
  } = props ?? {};

  const chains =
    supportedChainIds && supportedChainIds.length > 0
      ? supportedChainIds.map((chainId) => defineChain(chainId))
      : [chain];

  const openConnectModal = () =>
    setRootElement(
      <ConnectModal
        open
        size={connectModalSize}
        onOpenChange={() => setRootElement(null)}
        {...connectModalProps}
      />,
    );

  const openAccountModal = () =>
    openWalletDetailsModal({
      client,
      chains: [arbitrum, arbitrumSepolia],
      theme: THEME,
      locale: getLocaleId(),
      displayBalanceToken: chains.reduce(
        (acc, chain) => {
          const magicAddress = getContractAddress(chain.id, "MAGIC");
          if (magicAddress) {
            acc[chain.id] = magicAddress;
          }

          return acc;
        },
        {} as Record<number, string>,
      ),
      supportedTokens: chains.reduce((acc, chain) => {
        const addresses = getContractAddresses(chain.id);
        acc[chain.id] = SUPPORTED_TOKENS.map((token) => ({
          ...token,
          address: addresses[token.symbol] ?? ZERO_ADDRESS,
        })).filter(({ address }) => address !== ZERO_ADDRESS);
        return acc;
      }, {} as SupportedTokens),
      showTestnetFaucet: true,
      hideDisconnect,
      hideSwitchWallet,
      onDisconnect: () => {
        logOut();
      },
    });

  return { openConnectModal, openAccountModal };
};

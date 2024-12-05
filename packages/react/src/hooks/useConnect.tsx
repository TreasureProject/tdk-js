import {
  getContractAddress,
  getContractAddresses,
} from "@treasure-dev/tdk-core";
import { ZERO_ADDRESS, defineChain } from "thirdweb";
import {
  type SupportedTokens,
  type UseWalletDetailsModalOptions,
  darkTheme,
  useActiveWallet,
  useWalletDetailsModal,
} from "thirdweb/react";
import { ecosystemWallet } from "thirdweb/wallets";

import {
  ConnectModal,
  type Options as ConnectModalOptions,
  type Props as ConnectModalProps,
} from "../components/connect/ConnectModal";
import { UserDisplayName } from "../components/user/UserDisplayName";
import { useTreasure } from "../contexts/treasure";
import { getLocaleId } from "../i18n";
import {
  EVT_TREASURECONNECT_UI_ACCOUNT,
  EVT_TREASURECONNECT_UI_LOGIN,
} from "../utils/defaultAnalytics";

export type Options = ConnectModalOptions & {
  supportedChainIds?: number[];
  connectModalSize?: ConnectModalProps["size"];
  accountModalProps?: UseWalletDetailsModalOptions;
};

type Props = Options;

const THEME = darkTheme({
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
  const {
    chain,
    client,
    ecosystemId,
    ecosystemPartnerId,
    user,
    logIn,
    logOut,
    setRootElement,
    isUsingTreasureLauncher,
    openLauncherAccountModal,
    trackCustomEvent,
  } = useTreasure();
  const activeWallet = useActiveWallet();
  const { open: openWalletDetailsModal } = useWalletDetailsModal();
  const {
    supportedChainIds,
    connectModalSize,
    accountModalProps,
    ...connectModalProps
  } = props ?? {};

  const chains =
    supportedChainIds && supportedChainIds.length > 0
      ? supportedChainIds.map((chainId) => defineChain(chainId))
      : [chain];

  const openConnectModal = () => {
    if (isUsingTreasureLauncher) {
      console.debug(
        "[useConnect] openConnectModal cannot be used when Treasure Launcher is being used",
      );
      return;
    }

    trackCustomEvent({
      name: EVT_TREASURECONNECT_UI_LOGIN,
    });

    setRootElement(
      <ConnectModal
        open
        size={connectModalSize}
        onOpenChange={() => setRootElement(null)}
        {...connectModalProps}
      />,
    );
  };

  const openAccountModal = () => {
    trackCustomEvent({
      name: EVT_TREASURECONNECT_UI_ACCOUNT,
      properties: {
        isUsingTreasureLauncher,
      },
    });

    if (isUsingTreasureLauncher) {
      openLauncherAccountModal(connectModalSize);
      return;
    }

    openWalletDetailsModal({
      client,
      chains,
      theme: THEME,
      locale: getLocaleId(),
      connectOptions: {
        chain,
        wallets: [
          ecosystemWallet(ecosystemId, {
            partnerId: ecosystemPartnerId,
          }),
        ],
        hiddenWallets: ["inApp"],
      },
      connectedAccountAvatarUrl: user?.pfp ?? undefined,
      connectedAccountName: user ? (
        <UserDisplayName address={user.address} tag={user.tag} />
      ) : undefined,
      networkSelector: {
        onSwitch: (nextChain) => {
          if (activeWallet) {
            logIn(activeWallet, nextChain.id, true);
          }
        },
      },
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
      onDisconnect: () => {
        logOut();
      },
      ...accountModalProps,
    });
  };

  return { openConnectModal, openAccountModal };
};

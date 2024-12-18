import { getContractAddress } from "@treasure-dev/tdk-core";
import { defineChain } from "thirdweb";
import {
  type UseWalletDetailsModalOptions,
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

import {
  CONNECT_MODAL_SUPPORTED_TOKENS,
  CONNECT_MODAL_THEME,
} from "../constants";

export type Options = ConnectModalOptions & {
  supportedChainIds?: number[];
  connectModalSize?: ConnectModalProps["size"];
  accountModalProps?: UseWalletDetailsModalOptions;
};

export const useConnect = (options?: Options) => {
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
  } = options ?? {};

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
      theme: CONNECT_MODAL_THEME,
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
      supportedTokens: CONNECT_MODAL_SUPPORTED_TOKENS,
      showTestnetFaucet: true,
      onDisconnect: () => {
        logOut();
      },
      ...accountModalProps,
    });
  };

  return { openConnectModal, openAccountModal };
};

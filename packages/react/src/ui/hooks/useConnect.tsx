import { getContractAddress } from "@treasure-dev/tdk-core";
import { defineChain } from "thirdweb";
import { treasure } from "thirdweb/chains";
import {
  type UseWalletDetailsModalOptions,
  useActiveWallet,
  useWalletDetailsModal,
} from "thirdweb/react";
import { ecosystemWallet } from "thirdweb/wallets";

import { useTreasure } from "../../providers/treasure";
import {
  EVT_TREASURECONNECT_UI_ACCOUNT,
  EVT_TREASURECONNECT_UI_LOGIN,
} from "../../utils/defaultAnalytics";
import {
  ConnectModal,
  type Options as ConnectModalOptions,
  type Props as ConnectModalProps,
} from "../ConnectModal/ConnectModal";
import { UserDisplayName } from "../User/UserDisplayName";

import {
  CONNECT_MODAL_SUPPORTED_TOKENS,
  CONNECT_MODAL_THEME,
} from "../../constants";
import { useTranslation } from "./useTranslation";

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
    isUsingLauncherAuthToken,
    openLauncherAccountModal,
    trackCustomEvent,
  } = useTreasure();
  const { thirdwebLocale } = useTranslation();
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

    if (isUsingLauncherAuthToken) {
      openLauncherAccountModal(connectModalSize);
      return;
    }

    openWalletDetailsModal({
      client,
      chains,
      theme: CONNECT_MODAL_THEME,
      locale: thirdwebLocale,
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
            logIn(activeWallet, nextChain.id, undefined, true);
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
      payOptions: {
        prefillBuy: {
          chain: treasure,
        },
      },
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

import { useMemo, useState } from "react";
import {
  darkTheme,
  lightTheme,
  useConnectModal,
  useWalletDetailsModal,
} from "thirdweb/react";
import { useTreasure } from "../contexts/treasure";

import type { Wallet } from "thirdweb/wallets";
import { SUPPORTED_WALLETS } from "../utils/wallet";

type Props = {
  appName: string;
  appIconUri?: string;
  theme?: "light" | "dark";
};

export const useConnect = ({ appName, appIconUri, theme = "light" }: Props) => {
  const { chain, contractAddresses, thirdwebClient, logIn, logOut } =
    useTreasure();
  const { connect } = useConnectModal();
  const { open: openWalletDetailsModal } = useWalletDetailsModal();
  const [{ status, description }, setState] = useState<{
    status: "idle" | "loading" | "error";
    description?: string;
  }>({ status: "idle" });

  const modalTheme = useMemo(
    () =>
      theme === "dark"
        ? darkTheme({
            colors: {
              accentButtonBg: "#DC2626",
              accentButtonText: "#E7E8E9",
              accentText: "#DC2626",
              primaryButtonBg: "#DC2626",
              primaryButtonText: "#E7E8E9",
              modalBg: "#19253A",
              modalOverlayBg: "rgba(0, 0, 0, 0.3)",
              borderColor: "#70747D",
            },
          })
        : lightTheme({
            colors: {
              accentButtonBg: "#DC2626",
              accentButtonText: "#FFFFFF",
              accentText: "#DC2626",
              primaryButtonBg: "#DC2626",
              primaryButtonText: "#FFFFFF",
              modalBg: "#FFFDF7",
              modalOverlayBg: "rgba(0, 0, 0, 0.3)",
            },
          }),
    [theme],
  );

  const openConnectModal = async () => {
    const wallet = await connect({
      client: thirdwebClient,
      wallets: SUPPORTED_WALLETS,
      chain,
      accountAbstraction: {
        chain,
        factoryAddress: contractAddresses.ManagedAccountFactory,
        sponsorGas: true,
      },
      size: "compact",
      title: `Connect to ${appName}`,
      titleIcon:
        appIconUri ?? "https://images.treasure.lol/tdk/login/treasure_icon.png",
      showThirdwebBranding: false,
      theme: modalTheme,
    });
    const account = (wallet as Wallet).getAccount();
    if (account) {
      setState({ status: "loading", description: "Starting session..." });
      try {
        await logIn(account);
        setState({ status: "idle" });
      } catch (err) {
        logOut();
        setState({ status: "error", description: (err as Error).message });
      }
    }
  };

  const openAccountModal = () =>
    openWalletDetailsModal({
      client: thirdwebClient,
      theme: modalTheme,
      supportedTokens: contractAddresses.MAGIC
        ? {
            [chain.id]: [
              {
                address: contractAddresses.MAGIC,
                name: "MAGIC",
                symbol: "MAGIC",
                icon: "https://images.treasure.lol/tdk/login/magic.png",
              },
            ],
          }
        : undefined,
      // TODO: upgrade thirdweb and uncomment
      // onDisconnect: () => {
      //   logOut();
      // },
    });

  return { status, description, openConnectModal, openAccountModal };
};

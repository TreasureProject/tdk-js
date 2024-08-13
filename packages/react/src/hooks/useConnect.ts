import { useMemo, useState } from "react";
import {
  darkTheme,
  lightTheme,
  useConnectModal,
  useWalletDetailsModal,
} from "thirdweb/react";
import { useTreasure } from "../contexts/treasure";

import {
  type InAppWalletAuth,
  type Wallet,
  inAppWallet,
} from "thirdweb/wallets";
import { SUPPORTED_WALLETS } from "../utils/wallet";

type Props = {
  appName: string;
  appIconUri?: string;
  theme?: "light" | "dark";
  supportedAuthOptions?: InAppWalletAuth[];
  mode?: "redirect" | "popup" | undefined;
};

export const useConnect = ({
  appName,
  appIconUri,
  theme = "light",
  supportedAuthOptions,
  mode,
}: Props) => {
  const { chain, contractAddresses, client, logIn, logOut } = useTreasure();
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
    const wallet = (await connect({
      client,
      wallets: supportedAuthOptions
        ? [inAppWallet({ auth: { options: supportedAuthOptions, mode } })]
        : SUPPORTED_WALLETS,
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
    })) as Wallet;
    setState({ status: "loading", description: "Starting session..." });
    try {
      await logIn(wallet);
      setState({ status: "idle" });
    } catch (err) {
      logOut();
      setState({ status: "error", description: (err as Error).message });
    }
  };

  const openAccountModal = () =>
    openWalletDetailsModal({
      client,
      theme: modalTheme,
      supportedTokens: {
        [chain.id]: [
          ...(contractAddresses.MAGIC
            ? [
                {
                  address: contractAddresses.MAGIC,
                  name: "MAGIC",
                  symbol: "MAGIC",
                  icon: "https://images.treasure.lol/tdk/login/magic.png",
                },
              ]
            : []),
          ...(contractAddresses.VEE
            ? [
                {
                  address: contractAddresses.VEE,
                  name: "VEE",
                  symbol: "VEE",
                  icon: "https://images.treasure.lol/tdk/login/vee.png",
                },
              ]
            : []),
        ],
      },
      onDisconnect: () => {
        logOut();
      },
    });

  return { status, description, openConnectModal, openAccountModal };
};

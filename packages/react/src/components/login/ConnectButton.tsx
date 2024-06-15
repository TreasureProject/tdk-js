import {
  getContractAddress,
  getContractAddresses,
  truncateEthAddress,
} from "@treasure-dev/tdk-core";
import { useTranslation } from "react-i18next";
import {
  ConnectButton as ThirdwebConnectButton,
  darkTheme,
  lightTheme,
} from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";

import { defineChain } from "thirdweb";
import { useTreasure } from "../../context";
import { TreasureIcon } from "../../icons/TreasureIcon";

const wallets = [
  inAppWallet({
    auth: {
      options: ["email", "google", "apple", "facebook"],
    },
  }),
];

type Props = {
  appName: string;
  appIconUri?: string;
  theme?: "light" | "dark";
};

export const ConnectButton = ({
  appName,
  appIconUri,
  theme = "light",
}: Props) => {
  const { chainId, tdk, thirdwebClient, user, authenticate, logOut } =
    useTreasure();
  const contractAddresses = getContractAddresses(chainId);
  const { t } = useTranslation();

  const chain = defineChain(chainId);

  return (
    <ThirdwebConnectButton
      client={thirdwebClient}
      wallets={wallets}
      chain={chain}
      accountAbstraction={{
        chain,
        factoryAddress: contractAddresses.ManagedAccountFactory,
        sponsorGas: true,
      }}
      auth={{
        isLoggedIn: async (address) =>
          user?.smartAccountAddress.toLowerCase() === address.toLowerCase(),
        getLoginPayload: async ({ address }) =>
          tdk.auth.getLoginPayload({ address }),
        doLogin: async (params) => {
          const { token, user } = await tdk.auth.logIn(params);
          try {
            await authenticate(token, user);
          } catch (err) {
            console.error("Error authenticating user:", err);
            throw err;
          }
        },
        doLogout: async () => {
          logOut();
        },
      }}
      theme={
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
            })
      }
      connectButton={{
        label: (
          <>
            <TreasureIcon
              className="tdk-w-5 tdk-h-5 tdk-text-white"
              starsFill="#C62222"
            />
            <span className="tdk-ml-1">{t("login.connect")}</span>
          </>
        ),
        style: {
          minHeight: 40,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
      connectModal={{
        size: "compact",
        title: `Connect to ${appName}`,
        titleIcon:
          appIconUri ??
          "https://images.treasure.lol/tdk/login/treasure_icon.png",
        showThirdwebBranding: false,
      }}
      signInButton={{
        style: {
          minHeight: 40,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
      detailsButton={{
        render: () => (
          <button
            type="button"
            className="tdk-p-3 tdk-bg-[#FFFCF3] tdk-flex tdk-items-center tdk-justify-between tdk-gap-5 hover:tdk-bg-honey-400 tdk-transition-colors tdk-rounded-xl tdk-text-left focus:tdk-outline-none"
          >
            <div>
              <span className="tdk-text-sm tdk-text-[#0A111C] tdk-font-medium tdk-block">
                {user?.email}
              </span>
              <span className="tdk-text-xs tdk-text-night-600 tdk-block">
                {truncateEthAddress(user?.smartAccountAddress)}
              </span>
            </div>
            <TreasureIcon className="tdk-w-8 tdk-h-8 tdk-text-ruby-900" />
          </button>
        ),
      }}
      supportedTokens={
        contractAddresses.MAGIC
          ? {
              [chainId]: [
                {
                  address: contractAddresses.MAGIC,
                  name: "MAGIC",
                  symbol: "MAGIC",
                  icon: "https://images.treasure.lol/tdk/login/magic.png",
                },
              ],
            }
          : undefined
      }
    />
  );
};

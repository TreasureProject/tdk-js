import { truncateEthAddress } from "@treasure-dev/tdk-core";
import { useTranslation } from "react-i18next";
import { ConnectButton as ThirdwebConnectButton } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { useCopyToClipboard } from "usehooks-ts";

import { useTreasure } from "../../context";
import { useTreasureConnect } from "../../hooks/connect/useTreasureConnect";
import { CopyIcon } from "../../icons/CopyIcon";
import { ExitIcon } from "../../icons/ExitIcon";
import { TreasureIcon } from "../../icons/TreasureIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";

const wallets = [
  inAppWallet({
    auth: {
      options: ["email", "google", "apple", "facebook"],
    },
  }),
];

export const ConnectButton = () => {
  const { tdk, thirdwebClient, thirdwebChain } = useTreasure();
  const {
    project,
    factoryAddress,
    sponsorGas,
    isAuthenticated,
    user,
    requiresSession,
    hasActiveSession,
    authenticate,
    logOut,
    createSession,
  } = useTreasureConnect();
  const { t } = useTranslation();
  const [, copy] = useCopyToClipboard();

  return (
    <ThirdwebConnectButton
      client={thirdwebClient}
      wallets={wallets}
      chain={thirdwebChain}
      accountAbstraction={{
        chain: thirdwebChain,
        factoryAddress,
        sponsorGas,
      }}
      auth={{
        isLoggedIn: async (connectedAddress) =>
          isAuthenticated &&
          user?.smartAccountAddress.toLowerCase() ===
            connectedAddress.toLowerCase(),
        getLoginPayload: async ({ address }) =>
          tdk.auth.getLoginPayload({ address }),
        doLogin: async (params) => {
          const { token, user } = await tdk.auth.logIn(params);
          authenticate(token, user);

          if (!requiresSession) {
            console.debug(
              "Session not required by project, skipping session creation",
            );
            return;
          }

          if (hasActiveSession) {
            console.debug("Using existing session key");
            return;
          }

          console.debug("Creating new session key");
          try {
            await createSession();
          } catch (err) {
            console.error("Error creating new session key:", err);
            throw err;
          }
        },
        doLogout: async () => {
          logOut();
        },
      }}
      theme="dark"
      connectButton={{
        label: t("login.connect"),
        style: {
          color: "#FFFFFF",
          backgroundColor: "#DC2626",
        },
      }}
      signInButton={{
        style: {
          color: "#FFFFFF",
          backgroundColor: "#DC2626",
        },
      }}
      connectModal={{
        size: "compact",
        title: project?.name ? `Connect to ${project.name}` : "Connect",
        titleIcon:
          project?.icon ??
          "https://images.treasure.lol/tdk/login/treasure_icon.png",
        showThirdwebBranding: false,
      }}
      detailsButton={{
        render: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="tdk-p-3 tdk-bg-[#FFFCF3] tdk-flex tdk-items-center tdk-justify-between tdk-gap-5 hover:tdk-bg-honey-400 tdk-transition-colors tdk-rounded-xl tdk-text-left focus:tdk-outline-none"
              >
                <div>
                  <span className="tdk-text-sm tdk-text-[#0A111C] tdk-font-medium block">
                    {user?.email}
                  </span>
                  <span className="tdk-text-xs tdk-text-night-600 block">
                    {truncateEthAddress(user?.smartAccountAddress)}
                  </span>
                </div>
                <TreasureIcon className="tdk-w-8 tdk-h-8 tdk-text-ruby-900" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="tdk-w-[var(--radix-dropdown-menu-trigger-width)]">
              <DropdownMenuItem>
                <button
                  type="button"
                  className="tdk-flex tdk-items-center tdk-gap-1 tdk-w-full tdk-px-2 tdk-py-1.5"
                  onClick={() => copy(user?.smartAccountAddress ?? "")}
                >
                  <CopyIcon className="tdk-w-5 tdk-h-5" />
                  {t("common.copyAddress")}
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button
                  type="button"
                  className="tdk-flex tdk-items-center tdk-gap-1 tdk-text-ruby-800 tdk-w-full tdk-px-2 tdk-py-1.5"
                  onClick={() => logOut()}
                >
                  <ExitIcon className="tdk-w-5 tdk-h-5" />
                  {t("login.disconnect")}
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }}
    />
    // <Button
    //   as="link"
    //   href={loginUrl}
    //   className="tdk-inline-flex tdk-items-center tdk-gap-1"
    // >
    //   <TreasureIcon
    //     className="tdk-w-5 tdk-h-5 tdk-text-white"
    //     starsFill="#C62222"
    //   />
    //   {t("login.connect")}
    // </Button>
  );
};

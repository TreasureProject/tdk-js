import {
  type WalletComponents,
  getTreasureLauncherAuthToken,
  getTreasureLauncherWalletComponents,
} from "@treasure-dev/launcher";
import { jwtDecode } from "jwt-decode";
import { type ReactNode, useEffect, useState } from "react";
import type { AuthStoredTokenWithCookieReturnType } from "thirdweb/dist/types/wallets/in-app/core/authentication/types";
import { AccountModal } from "../components/launcher/AccountModal";

type Props = {
  getAuthTokenOverride?: () => string | undefined;
  getWalletComponentsOverride?: () => WalletComponents | undefined;
  setRootElement: (el: ReactNode) => void;
  onAuthTokenUpdated: (authToken: string) => void;
  onWalletComponentsUpdated: (
    authResult: AuthStoredTokenWithCookieReturnType,
    authProvider: string,
    walletId: string,
    authCookie: string,
  ) => Promise<void>;
};

export const useLauncher = ({
  getAuthTokenOverride,
  getWalletComponentsOverride,
  setRootElement,
  onAuthTokenUpdated,
  onWalletComponentsUpdated,
}: Props) => {
  const authToken = getAuthTokenOverride?.() ?? getTreasureLauncherAuthToken();
  const walletComponents: WalletComponents | undefined =
    getWalletComponentsOverride?.() ?? getTreasureLauncherWalletComponents();

  const [isUsingTreasureLauncher, setIsUsingTreasureLauncher] = useState(false);
  const [isUsingLauncherAuthToken, setIsUserLauncherAuthToken] =
    useState(false);

  const openLauncherAccountModal = (size?: "lg" | "xl" | "2xl" | "3xl") => {
    if (!isUsingTreasureLauncher) {
      console.debug(
        "[useLauncher] openLauncherAccountModal cannot be used when not using Treasure Launcher",
      );
      return;
    }

    setRootElement(
      <AccountModal
        open
        size={size}
        onOpenChange={() => setRootElement(null)}
      />,
    );
  };

  useEffect(() => {
    if (walletComponents) {
      console.debug("[useLauncher] Using launcher wallet components");
      const authResult: AuthStoredTokenWithCookieReturnType = jwtDecode(
        walletComponents.authCookie,
      );
      onWalletComponentsUpdated(
        authResult,
        walletComponents.authProvider,
        walletComponents.walletId,
        walletComponents.authCookie,
      );
      setIsUsingTreasureLauncher(true);
      return;
    }
    if (authToken) {
      console.debug("[useLauncher] Using launcher auth token");
      setIsUsingTreasureLauncher(true);
      setIsUserLauncherAuthToken(true);
      onAuthTokenUpdated(authToken);
      return;
    }
    setIsUsingTreasureLauncher(false);
  }, [
    authToken,
    onAuthTokenUpdated,
    walletComponents,
    onWalletComponentsUpdated,
  ]);

  return {
    isUsingTreasureLauncher,
    isUsingLauncherAuthToken,
    openLauncherAccountModal,
  };
};

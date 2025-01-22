import {
  type WalletComponents,
  getTreasureLauncherAuthToken,
  getTreasureLauncherWalletComponents,
} from "@treasure-dev/launcher";
import { type ReactNode, useEffect } from "react";
import { AccountModal } from "../components/launcher/AccountModal";

type Props = {
  getAuthTokenOverride?: () => string | undefined;
  setRootElement: (el: ReactNode) => void;
  onAuthTokenUpdated: (authToken: string) => void;
  onWalletComponentsUpdated: (walletComponents: WalletComponents) => void;
};

export const useLauncher = ({
  getAuthTokenOverride,
  setRootElement,
  onAuthTokenUpdated,
  onWalletComponentsUpdated,
}: Props) => {
  const authToken = getAuthTokenOverride?.() ?? getTreasureLauncherAuthToken();
  const isUsingTreasureLauncher =
    authToken !== undefined && authToken.length > 0;
  const walletComponents: WalletComponents | undefined =
    getTreasureLauncherWalletComponents();

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
      onWalletComponentsUpdated(walletComponents);
      return;
    }
    if (authToken) {
      console.debug("[useLauncher] Using launcher auth token");
      onAuthTokenUpdated(authToken);
    }
  }, [
    authToken,
    onAuthTokenUpdated,
    walletComponents,
    onWalletComponentsUpdated,
  ]);

  return {
    isUsingTreasureLauncher,
    openLauncherAccountModal,
  };
};

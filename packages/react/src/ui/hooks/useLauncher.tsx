import {
  type WalletComponents,
  getTreasureLauncherAuthToken,
  getTreasureLauncherWalletComponents,
} from "@treasure-dev/launcher";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useActiveWallet } from "thirdweb/react";
import { AccountModal } from "../AccountModal";

type Props = {
  getAuthTokenOverride?: () => string | undefined;
  getWalletComponentsOverride?: () => WalletComponents | undefined;
  setRootElement: (el: ReactNode) => void;
  onAuthTokenUpdated: (authToken: string) => void;
};

export const useLauncher = ({
  getAuthTokenOverride,
  getWalletComponentsOverride,
  setRootElement,
  onAuthTokenUpdated,
}: Props) => {
  const activeWallet = useActiveWallet();
  const hasSetUrlParams = useRef(false);

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

  const onWalletComponentsUpdated = useCallback(
    async (authProvider: string, walletId: string, authCookie: string) => {
      if (activeWallet || hasSetUrlParams.current) {
        return;
      }
      hasSetUrlParams.current = true;

      const url = new URL(window.location.href);
      url.searchParams.set("authProvider", authProvider);
      url.searchParams.set("walletId", walletId);
      url.searchParams.set("authCookie", authCookie);
      window.history.pushState({}, "", url.toString());
    },
    [activeWallet],
  );

  useEffect(() => {
    const authToken =
      getAuthTokenOverride?.() ?? getTreasureLauncherAuthToken();
    const walletComponents: WalletComponents | undefined =
      getWalletComponentsOverride?.() ?? getTreasureLauncherWalletComponents();

    if (walletComponents) {
      onWalletComponentsUpdated(
        walletComponents.authProvider,
        walletComponents.walletId,
        walletComponents.authCookie,
      );
      setIsUsingTreasureLauncher(true);
      return;
    }
    if (authToken) {
      setIsUsingTreasureLauncher(true);
      setIsUserLauncherAuthToken(true);
      onAuthTokenUpdated(authToken);
      return;
    }
    setIsUsingTreasureLauncher(false);
  }, [
    getAuthTokenOverride,
    getWalletComponentsOverride,
    onAuthTokenUpdated,
    onWalletComponentsUpdated,
  ]);

  return {
    isUsingTreasureLauncher,
    isUsingLauncherAuthToken,
    openLauncherAccountModal,
  };
};

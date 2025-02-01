import { getTreasureLauncherAuthToken } from "@treasure-dev/launcher";
import { type ReactNode, useEffect } from "react";

import { AccountModal } from "../AccountModal";

type Props = {
  getAuthTokenOverride?: () => string | undefined;
  setRootElement: (el: ReactNode) => void;
  onAuthTokenUpdated: (authToken: string) => void;
};

export const useLauncher = ({
  getAuthTokenOverride,
  setRootElement,
  onAuthTokenUpdated,
}: Props) => {
  const authToken = getAuthTokenOverride?.() ?? getTreasureLauncherAuthToken();
  const isUsingTreasureLauncher =
    authToken !== undefined && authToken.length > 0;

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
    if (authToken) {
      console.debug("[useLauncher] Using launcher auth token");
      onAuthTokenUpdated(authToken);
    }
  }, [authToken, onAuthTokenUpdated]);

  return {
    isUsingTreasureLauncher,
    openLauncherAccountModal,
  };
};

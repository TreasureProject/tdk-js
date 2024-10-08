import {
  getTreasureLauncherAuthToken,
  startUserSessionViaLauncher,
} from "@treasure-dev/launcher";
import type { SessionOptions, TDKAPI, User } from "@treasure-dev/tdk-core";
import { type ReactNode, useCallback, useEffect } from "react";
import { AccountModal } from "../components/launcher/AccountModal";
import { setStoredAuthToken } from "../utils/store";

type Props = {
  getAuthTokenOverride?: () => string | undefined;
  tdk: TDKAPI;
  setRootElement: (el: ReactNode) => void;
  setUser: (user: User) => void;
  onConnect?: (user: User) => void;
};

export const useLauncher = ({
  getAuthTokenOverride,
  tdk,
  setUser,
  setRootElement,
  onConnect,
}: Props) => {
  const getAuthToken = useCallback(() => {
    return getAuthTokenOverride?.() ?? getTreasureLauncherAuthToken();
  }, [getAuthTokenOverride]);

  const isUsingTreasureLauncher = useCallback((): boolean => {
    return getAuthToken() !== undefined;
  }, [getAuthToken]);

  const startUserSessionViaLauncherIfNeeded = useCallback(
    (options: SessionOptions) => {
      if (isUsingTreasureLauncher()) {
        return startUserSessionViaLauncher(options);
      }
      return undefined;
    },
    [isUsingTreasureLauncher],
  );

  const openLauncherAccountModal = (size?: "lg" | "xl" | "2xl" | "3xl") => {
    if (!isUsingTreasureLauncher()) {
      console.debug(
        "[useLauncher] openLauncherAccountModal cannot be used when not using Treasure Launcher",
      );
      return;
    }
    console.debug(
      "[useLauncher] openLauncherAccountModal is not yet supported",
    );

    setRootElement(
      <AccountModal
        open
        size={size}
        onOpenChange={() => setRootElement(null)}
      />,
    );
  };

  useEffect(() => {
    const launcherAuthToken: string | undefined = getAuthToken();
    if (launcherAuthToken) {
      console.debug("[useLauncher] Using launcher auth token");
      tdk.setAuthToken(launcherAuthToken);

      tdk.user
        .me({ overrideAuthToken: launcherAuthToken })
        .then((nextUser) => {
          setUser(nextUser);
          setStoredAuthToken(launcherAuthToken);
          onConnect?.(nextUser);
        })
        .catch((error) => {
          console.debug("[useLauncher] Error fetching launcher user:", error);
        });
    }
  }, [getAuthToken, tdk, setUser, onConnect]);

  return {
    isUsingTreasureLauncher,
    startUserSessionViaLauncherIfNeeded,
    openLauncherAccountModal,
  };
};

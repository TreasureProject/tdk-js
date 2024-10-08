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
  const authToken = getAuthTokenOverride?.() ?? getTreasureLauncherAuthToken();
  const isUsingTreasureLauncher = authToken !== undefined;

  const startUserSessionViaLauncherIfNeeded = useCallback(
    (options: SessionOptions) => {
      if (isUsingTreasureLauncher) {
        return startUserSessionViaLauncher(options);
      }
      return undefined;
    },
    [isUsingTreasureLauncher],
  );

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
      tdk.setAuthToken(authToken);

      tdk.user
        .me({ overrideAuthToken: authToken })
        .then((nextUser) => {
          setUser(nextUser);
          setStoredAuthToken(authToken);
          onConnect?.(nextUser);
        })
        .catch((error) => {
          console.debug("[useLauncher] Error fetching launcher user:", error);
        });
    }
  }, [authToken, tdk, setUser, onConnect]);

  return {
    isUsingTreasureLauncher,
    startUserSessionViaLauncherIfNeeded,
    openLauncherAccountModal,
  };
};

import {
  getTreasureLauncherAuthToken,
  startUserSessionViaLauncher,
} from "@treasure-dev/launcher";
import type { SessionOptions, User } from "@treasure-dev/tdk-core";
import { useCallback, useEffect } from "react";
import { setStoredAuthToken } from "../utils/store";

type Props = {
  getAuthTokenOverride?: () => string | undefined;
  setAuthToken: (token: string) => void;
  setUser: (user: User) => void;
  getUser: ({
    overrideAuthToken,
  }: { overrideAuthToken?: string }) => Promise<User>;
  onConnect?: (user: User) => void;
};

export const useLauncher = ({
  getAuthTokenOverride,
  setAuthToken,
  setUser,
  getUser,
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

  useEffect(() => {
    const launcherAuthToken: string | undefined = getAuthToken();
    if (launcherAuthToken) {
      console.debug("[useLauncher] Using launcher auth token");
      setAuthToken(launcherAuthToken);

      getUser({ overrideAuthToken: launcherAuthToken })
        .then((nextUser) => {
          setUser(nextUser);
          setStoredAuthToken(launcherAuthToken);
          onConnect?.(nextUser);
        })
        .catch((error) => {
          console.debug("[useLauncher] Error fetching launcher user:", error);
        });
    }
  }, [getAuthToken, setAuthToken, getUser, setUser, onConnect]);

  return {
    isUsingTreasureLauncher,
    startUserSessionViaLauncherIfNeeded,
  };
};

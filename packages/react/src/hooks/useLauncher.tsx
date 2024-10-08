import {
  getTreasureLauncherAuthToken,
  startUserSessionViaLauncher,
} from "@treasure-dev/launcher";
import type { SessionOptions } from "@treasure-dev/tdk-core";
import { useCallback } from "react";

type Props = {
  getAuthTokenOverride?: () => string | undefined;
};

export const useLauncher = ({ getAuthTokenOverride }: Props) => {
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

  return {
    getAuthToken,
    isUsingTreasureLauncher,
    startUserSessionViaLauncherIfNeeded,
  };
};

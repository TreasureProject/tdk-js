import type { SessionOptions } from "@treasure-dev/tdk-core";
import { isUsingTreasureLauncher } from "./utils";

export function startUserSessionViaLauncher({
  backendWallet,
  approvedTargets,
  nativeTokenLimitPerTransaction,
  sessionDurationSec,
  sessionMinDurationLeftSec,
}: SessionOptions): Promise<void> {
  if (!isUsingTreasureLauncher()) {
    return Promise.reject(
      new Error(
        "startUserSessionViaLauncher can only be used with Treasure Launcher",
      ),
    );
  }

  return fetch("http://localhost:16001/tdk-start-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      backendWallet,
      approvedTargets,
      nativeTokenLimitPerTransaction,
      sessionDurationSec,
      sessionMinDurationLeftSec,
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to start session");
    }
  });
}

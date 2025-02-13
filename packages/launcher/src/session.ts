import type { SessionOptions } from "@treasure-dev/tdk-core";
import { getTreasureLauncherPort, isUsingTreasureLauncher } from "./utils";

export async function startUserSessionViaLauncher({
  sessionOptions,
  getPort,
}: {
  sessionOptions: SessionOptions;
  getPort?: () => number;
}): Promise<void> {
  if (!isUsingTreasureLauncher()) {
    return Promise.reject(
      new Error(
        "startUserSessionViaLauncher can only be used with Treasure Launcher",
      ),
    );
  }

  const {
    backendWallet,
    approvedTargets,
    nativeTokenLimitPerTransaction,
    sessionDurationSec,
    sessionMinDurationLeftSec,
  } = sessionOptions;

  const port = getPort?.() ?? getTreasureLauncherPort();

  const response = await fetch(`http://localhost:${port}/tdk-start-session`, {
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
  });
  if (!response.ok) {
    throw new Error("Failed to start session");
  }
}

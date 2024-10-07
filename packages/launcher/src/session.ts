import type { SessionOptions } from "@treasure-dev/tdk-core";
import axios from "axios";
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
  return axios.post("http://localhost:16001/tdk-start-session", {
    backendWallet,
    approvedTargets,
    nativeTokenLimitPerTransaction,
    sessionDurationSec,
    sessionMinDurationLeftSec,
  });
}

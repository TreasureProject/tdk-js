import type { SessionOptions } from "@treasure-dev/tdk-core";
import axios from "axios";

export function startUserSessionViaLauncher({
  backendWallet,
  approvedTargets,
  nativeTokenLimitPerTransaction,
  sessionDurationSec,
  sessionMinDurationLeftSec,
}: SessionOptions): Promise<void> {
  return axios.post("http://localhost:16001/tdk-start-session", {
    backendWallet,
    approvedTargets,
    nativeTokenLimitPerTransaction,
    sessionDurationSec,
    sessionMinDurationLeftSec,
  });
}

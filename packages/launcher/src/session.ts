import axios from "axios";

export function startUserSessionViaLauncher({
  backendWallet,
  approvedTargets,
  nativeTokenLimitPerTransaction,
  sessionDurationSec,
  sessionMinDurationLeftSec,
}: {
  backendWallet: string;
  approvedTargets: string[];
  nativeTokenLimitPerTransaction?: bigint;
  sessionDurationSec?: number;
  sessionMinDurationLeftSec?: number;
}): Promise<void> {
  return axios.post("http://localhost:16001/tdk-start-session", {
    backendWallet,
    approvedTargets,
    nativeTokenLimitPerTransaction,
    sessionDurationSec,
    sessionMinDurationLeftSec,
  });
}

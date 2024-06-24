import {
  type ThirdwebClient,
  defineChain,
  getContract,
  sendTransaction,
} from "thirdweb";
import { addSessionKey } from "thirdweb/extensions/erc4337";
import type { Account } from "thirdweb/wallets";

import {
  getDateHoursFromNow,
  getDateSecondsFromNow,
  getDateYearsFromNow,
} from "./date";

import { formatEther } from "viem";
import type { Session } from "../types";

export const isSessionRequired = ({
  approvedTargets = [],
  nativeTokenLimitPerTransaction = 0n,
}: {
  approvedTargets?: string[];
  nativeTokenLimitPerTransaction?: bigint;
}) => approvedTargets.length > 0 || nativeTokenLimitPerTransaction > 0;

export const validateSession = async ({
  backendWallet,
  approvedTargets: rawApprovedTargets,
  nativeTokenLimitPerTransaction = 0n,
  sessionMinDurationLeftSec = 3_600, // 1 hour
  sessions,
}: {
  backendWallet: string;
  approvedTargets: string[];
  nativeTokenLimitPerTransaction?: bigint;
  sessionMinDurationLeftSec?: number;
  sessions: Session[];
}) => {
  const approvedTargets = rawApprovedTargets.map((target) =>
    target.toLowerCase(),
  );

  // Skip check if no session is required
  if (!isSessionRequired({ approvedTargets, nativeTokenLimitPerTransaction })) {
    return true;
  }

  const nowDate = new Date();
  const minEndDate = getDateSecondsFromNow(sessionMinDurationLeftSec);
  const maxEndDate = getDateYearsFromNow(10);
  return sessions.some((session) => {
    const startDate = new Date(Number(session.startTimestamp) * 1000);
    const endDate = new Date(Number(session.endTimestamp) * 1000);
    const signerApprovedTargets = session.approvedTargets.map((target) =>
      target.toLowerCase(),
    );
    return (
      // Expected backend wallet is signer
      session.signer.toLowerCase() === backendWallet?.toLowerCase() &&
      // Start date has passed
      startDate < nowDate &&
      // Expiration date meets minimum time requirements
      endDate >= minEndDate &&
      // Expiration date is not too far in the future (10 years because Thirdweb uses this for admins)
      // This check is to prevent sessions from being created with timestamps in milliseconds
      endDate <= maxEndDate &&
      // All requested targets are approved
      approvedTargets.every((target) =>
        signerApprovedTargets.includes(target),
      ) &&
      // Native token limit per transaction is approved
      (!nativeTokenLimitPerTransaction ||
        BigInt(session.nativeTokenLimitPerTransaction) >=
          nativeTokenLimitPerTransaction)
    );
  });
};

export const createSession = async ({
  client,
  chainId,
  account,
  backendWallet,
  approvedTargets,
  nativeTokenLimitPerTransaction: nativeTokenLimitPerTransactionBI = 0n,
  sessionDurationSec = 86_400, // 1 day
}: {
  client: ThirdwebClient;
  chainId: number;
  account: Account;
  backendWallet: string;
  approvedTargets: string[];
  nativeTokenLimitPerTransaction?: bigint;
  sessionDurationSec?: number;
}): Promise<Session> => {
  const contract = getContract({
    client,
    chain: defineChain(chainId),
    address: account.address,
  });
  const nativeTokenLimitPerTransaction = formatEther(
    nativeTokenLimitPerTransactionBI,
  );
  const startDate = getDateHoursFromNow(-1);
  const endDate = getDateSecondsFromNow(sessionDurationSec);
  const transaction = addSessionKey({
    contract,
    account,
    sessionKeyAddress: backendWallet,
    permissions: {
      approvedTargets,
      nativeTokenLimitPerTransaction,
      permissionStartTimestamp: startDate,
      permissionEndTimestamp: endDate,
    },
  });
  await sendTransaction({
    account,
    transaction,
  });
  return {
    signer: backendWallet,
    isAdmin: false,
    startTimestamp: Math.floor(startDate.getTime() / 1000).toString(),
    endTimestamp: Math.floor(endDate.getTime() / 1000).toString(),
    approvedTargets,
    nativeTokenLimitPerTransaction,
  };
};

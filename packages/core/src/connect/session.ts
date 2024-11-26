import {
  type ThirdwebClient,
  defineChain,
  getContract,
  sendTransaction,
  toEther,
} from "thirdweb";
import {
  addSessionKey,
  getAllActiveSigners,
  getAllAdmins,
} from "thirdweb/extensions/erc4337";
import type { Account, Wallet } from "thirdweb/wallets";

import type { TreasureClient } from "../client";
import type { Session, SessionOptions } from "../types";
import {
  getDateHoursFromNow,
  getDateSecondsFromNow,
  getDateYearsFromNow,
} from "../utils/date";

export const getUserSessions = async ({
  client,
  chainId,
  address,
}: {
  client: ThirdwebClient;
  chainId: number;
  address: string;
}): Promise<Session[]> => {
  const contract = getContract({
    client,
    chain: defineChain(chainId),
    address,
  });
  const [allActiveSigners, allAdmins] = await Promise.all([
    getAllActiveSigners({ contract }),
    getAllAdmins({ contract }),
  ]);
  return [
    ...allActiveSigners.map((activeSigner) => ({
      ...activeSigner,
      isAdmin: allAdmins.includes(activeSigner.signer),
      approvedTargets: activeSigner.approvedTargets.map((target) =>
        target.toLowerCase(),
      ),
      nativeTokenLimitPerTransaction:
        activeSigner.nativeTokenLimitPerTransaction.toString(),
      startTimestamp: activeSigner.startTimestamp.toString(),
      endTimestamp: activeSigner.endTimestamp.toString(),
    })),
    ...allAdmins.map((adminAddress) => ({
      isAdmin: true,
      signer: adminAddress,
      approvedTargets: [],
      nativeTokenLimitPerTransaction: "0",
      startTimestamp: "0",
      // Date in the distant future because admins don't expire until they're explicitly removed
      endTimestamp: (
        Math.floor(Date.now() / 1000) +
        60 * 60 * 24 * 365 * 10
      ).toString(),
    })),
  ];
};

export const validateSession = ({
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
  // Skip check if no session is required
  if (rawApprovedTargets.length === 0) {
    return true;
  }

  const approvedTargets = rawApprovedTargets.map((target) =>
    target.toLowerCase(),
  );

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
      // If this signer is an admin, they always have the required permissions
      (session.isAdmin ||
        // Start date has passed
        (startDate < nowDate &&
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
              nativeTokenLimitPerTransaction)))
    );
  });
};

const createSession = async ({
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
  const nativeTokenLimitPerTransaction = toEther(
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

export const startUserSession = async ({
  client,
  wallet,
  chainId,
  sessions: userSessions,
  options,
}: {
  client: TreasureClient;
  wallet: Wallet | undefined;
  chainId: number;
  sessions?: Session[];
  options: SessionOptions;
}) => {
  // Skip session creation if not required by app
  if (options.approvedTargets.length === 0) {
    console.debug("[TDK] Session not required by app");
    return;
  }

  // Get user sessions if not provided
  let sessions = userSessions;
  if (!sessions && wallet) {
    const address = wallet.getAccount()?.address;
    if (!address) {
      throw new Error(
        "Wallet and connected account required for session lookup",
      );
    }

    console.debug("[TDK] Fetching existing sessions");
    sessions = await getUserSessions({ client, chainId, address });
  }

  // Skip session creation if user has an active session already
  const hasActiveSession = validateSession({
    ...options,
    sessions: sessions ?? [],
  });
  if (hasActiveSession) {
    console.debug("[TDK] Using existing session");
    return;
  }

  // Session needs to be created, so a valid wallet is required
  if (!wallet) {
    throw new Error("Wallet required for session creation");
  }

  // Switch chains if requested session chain is different
  if (chainId !== wallet.getChain()?.id) {
    console.debug("[TDK] Switching chains for session creation:", chainId);
    await wallet.switchChain(defineChain(chainId));
  }

  const account = wallet.getAccount();
  if (!account) {
    throw new Error("Wallet account required for session creation");
  }

  console.debug("[TDK] Creating new session");
  try {
    await createSession({
      ...options,
      client,
      chainId,
      account,
    });
  } catch (err) {
    console.error("[TDK] Error creating user session:", err);
    throw err;
  }
};

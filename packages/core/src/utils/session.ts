import {
  type ThirdwebClient,
  defineChain,
  getContract,
  sendTransaction,
} from "thirdweb";
import { addSessionKey } from "thirdweb/extensions/erc4337";
import type { Account } from "thirdweb/wallets";

import {
  getDateDaysFromNow,
  getDateHoursFromNow,
  getDateYearsFromNow,
} from "./date";

import type { Session } from "../types";

export const isSessionRequired = ({
  approvedTargets = [],
  nativeTokenLimitPerTransaction = 0,
}: {
  approvedTargets?: string[];
  nativeTokenLimitPerTransaction?: number;
}) => approvedTargets.length > 0 || nativeTokenLimitPerTransaction > 0;

export const validateSession = async ({
  backendWallet,
  approvedTargets: rawApprovedTargets,
  nativeTokenLimitPerTransaction = 0,
  sessions,
}: {
  backendWallet: string;
  approvedTargets: string[];
  nativeTokenLimitPerTransaction?: number;
  sessions: Session[];
}) => {
  const approvedTargets = rawApprovedTargets.map((target) =>
    target.toLowerCase(),
  );

  // Skip check if no session is required
  if (!isSessionRequired({ approvedTargets, nativeTokenLimitPerTransaction })) {
    return true;
  }

  return sessions.some((session) => {
    const startDate = new Date(Number(session.startTimestamp) * 1000);
    const endDate = new Date(Number(session.endTimestamp) * 1000);
    const signerApprovedTargets = session.approvedTargets.map((target) =>
      target.toLowerCase(),
    );
    return (
      // Start date has passed
      startDate < new Date() &&
      // Expiration date is at least 1 hour in the future
      endDate > getDateHoursFromNow(1) &&
      // Expiration date is not too far in the future (10 years because Thirdweb uses this for admins)
      endDate <= getDateYearsFromNow(10) &&
      // Expected backend wallet is signer
      session.signer.toLowerCase() === backendWallet?.toLowerCase() &&
      // All requested targets are approved
      approvedTargets.every((target) =>
        signerApprovedTargets.includes(target),
      ) &&
      // Native token limit per transaction is approved
      (!nativeTokenLimitPerTransaction ||
        Number(session.nativeTokenLimitPerTransaction) >=
          nativeTokenLimitPerTransaction)
    );
  });
};

export const createSession = async ({
  client,
  chainId,
  address,
  account,
  backendWallet,
  approvedTargets,
  nativeTokenLimitPerTransaction,
}: {
  client: ThirdwebClient;
  chainId: number;
  address: string;
  account: Account;
  backendWallet: string;
  approvedTargets: string[];
  nativeTokenLimitPerTransaction?: number;
}) => {
  const contract = getContract({
    client,
    chain: defineChain(chainId),
    address,
  });
  const transaction = addSessionKey({
    contract,
    account,
    sessionKeyAddress: backendWallet,
    permissions: {
      approvedTargets,
      nativeTokenLimitPerTransaction,
      permissionStartTimestamp: getDateHoursFromNow(-1),
      permissionEndTimestamp: getDateDaysFromNow(1),
    },
  });
  await sendTransaction({
    account,
    transaction,
  });
};

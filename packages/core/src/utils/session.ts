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
  approvedTargets = [],
  nativeTokenLimitPerTransaction = 0,
  sessions,
}: {
  backendWallet?: string;
  approvedTargets?: string[];
  nativeTokenLimitPerTransaction?: number;
  sessions: Session[];
}) => {
  // Skip check if no session is required
  if (!isSessionRequired({ approvedTargets, nativeTokenLimitPerTransaction })) {
    return true;
  }

  return sessions.some(
    ({
      signer,
      approvedTargets: signerApprovedTargets,
      startTimestamp,
      endTimestamp,
    }) => {
      const startDate = new Date(Number(startTimestamp) * 1000);
      const endDate = new Date(Number(endTimestamp) * 1000);
      return (
        // Start date has passed
        startDate < new Date() &&
        // Expiration date is at least 1 hour in the future
        endDate > getDateHoursFromNow(1) &&
        // Expiration date is not too far in the future (10 years because Thirdweb uses this for admins)
        endDate <= getDateYearsFromNow(10) &&
        // Expected backend wallet is signer
        signer.toLowerCase() === backendWallet?.toLowerCase() &&
        // All requested targets are approved
        approvedTargets.every((target) =>
          signerApprovedTargets.includes(target),
        )
      );
    },
  );
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

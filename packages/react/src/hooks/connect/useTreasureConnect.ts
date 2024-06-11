import {
  type User,
  getDateDaysFromNow,
  getDateHoursFromNow,
  getDateYearsFromNow,
} from "@treasure-dev/tdk-core";
import { useCallback, useEffect, useState } from "react";
import { getContract, sendTransaction } from "thirdweb";
import { addSessionKey } from "thirdweb/extensions/erc4337";

import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { useTreasure } from "../../context";
import { useContractAddress } from "../../hooks/useContractAddress";
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "../../utils/store";
import { useProject } from "./useProject";

export const useTreasureConnect = () => {
  const { tdk, thirdwebClient, thirdwebChain } = useTreasure();
  const { address: factoryAddress } = useContractAddress(
    "ManagedAccountFactory",
  );
  const { data: project } = useProject();
  const wallet = useActiveWallet();
  const account = useActiveAccount();
  const [user, setUser] = useState<User | undefined>();

  const backendWallet = project?.backendWallets[0];
  const approvedTargets = (project?.callTargets ?? []).map((callTarget) =>
    callTarget.toLowerCase(),
  );
  const nativeTokenLimitPerTransaction = 0;
  const requiresSession =
    approvedTargets.length > 0 || nativeTokenLimitPerTransaction > 0;

  const logOut = useCallback(() => {
    tdk.clearAuthToken();
    clearStoredAuthToken();
    setUser(undefined);
    wallet?.disconnect();
  }, [tdk, wallet]);

  const authenticate = useCallback(
    async (authToken: string, user?: User) => {
      // Update the TDK client's auth token
      tdk.setAuthToken(authToken);

      // Fetch user if one wasn't provided
      if (user) {
        setUser(user);
      } else {
        try {
          const nextUser = await tdk.user.me();
          setUser(nextUser);
        } catch (err) {
          console.error("Error fetching current user details:", err);
          return logOut();
        }
      }

      // Store the auth token
      setStoredAuthToken(authToken);
    },
    [tdk, logOut],
  );

  // Check local storage for stored auth token
  useEffect(() => {
    const authToken = getStoredAuthToken();
    if (authToken) {
      authenticate(authToken);
    }
  }, [authenticate]);

  return {
    project,
    factoryAddress,
    sponsorGas: true,
    user,
    isAuthenticated: !!user,
    requiresSession,
    hasActiveSession:
      user?.allActiveSigners.some(
        ({ signer, approvedTargets: signerApprovedTargets, endTimestamp }) => {
          const endDate = new Date(Number(endTimestamp) * 1000);
          return (
            // Expiration date is at least 1 hour in the future
            endDate > getDateHoursFromNow(1) &&
            // Expiration date is not too far in the future (10 years because Thirdweb uses this for admins)
            endDate <= getDateYearsFromNow(10) &&
            // Expected backend wallet is signer
            signer.toLowerCase() === backendWallet?.toLowerCase() &&
            // All requested call targets are approved
            approvedTargets.every((callTarget) =>
              signerApprovedTargets.includes(callTarget),
            )
          );
        },
      ) ?? false,
    createSession: async () => {
      if (!user || !account || !backendWallet) {
        return;
      }

      const contract = getContract({
        client: thirdwebClient,
        chain: thirdwebChain,
        address: user.smartAccountAddress,
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
    },
    authenticate,
    logOut,
  };
};

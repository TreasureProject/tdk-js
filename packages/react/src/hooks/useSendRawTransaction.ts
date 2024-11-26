import {
  type TreasureConnectClient,
  isSmartWallet,
  sendRawTransaction,
} from "@treasure-dev/tdk-core";
import { useActiveWallet } from "thirdweb/react";
import type { Wallet } from "thirdweb/wallets";

import { useTreasure } from "../contexts/treasure";

export const useSendRawTransaction = () => {
  const treasure = useTreasure();
  const activeWallet = useActiveWallet();
  return {
    sendRawTransaction: (
      transaction: Parameters<typeof sendRawTransaction>[0]["transaction"],
      options?: Partial<{
        chainId?: number;
        client?: TreasureConnectClient;
        // Active wallet options
        wallet: Wallet<"smart">;
        // Backend wallet options
        apiUri?: string;
        authToken?: string;
        backendWallet: string;
      }>,
    ) => {
      const client = options?.client ?? treasure.client;
      const chainId = options?.chainId ?? treasure.chain.id;

      // Send transaction via backend if a backend wallet is provided
      if (options?.backendWallet) {
        const authToken = options.authToken ?? treasure.authToken;
        if (!authToken) {
          throw new Error(
            "Authenticated user required to send transaction with backend wallet",
          );
        }

        return sendRawTransaction({
          chainId,
          apiUri: options?.apiUri ?? client.apiUri,
          authToken,
          backendWallet: options.backendWallet,
          transaction,
        });
      }

      // Send transaction via active smart wallet
      const wallet = options?.wallet ?? activeWallet;
      if (!wallet || !isSmartWallet(wallet)) {
        throw new Error("No smart wallet found");
      }

      return sendRawTransaction({
        chainId,
        client,
        wallet,
        transaction,
      });
    },
  };
};

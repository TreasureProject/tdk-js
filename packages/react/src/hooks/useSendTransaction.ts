import {
  type ContractWriteTransaction,
  type TreasureClient,
  isSmartWallet,
  sendTransaction,
} from "@treasure-dev/tdk-core";
import type { Abi, ExtractAbiFunctionNames } from "abitype";
import { useActiveWallet } from "thirdweb/react";
import type { Wallet } from "thirdweb/wallets";

import { useTreasure } from "../contexts/treasure";

export const useSendTransaction = () => {
  const treasure = useTreasure();
  const activeWallet = useActiveWallet();
  return {
    sendTransaction: async <
      TAbi extends Abi,
      TFunctionName extends ExtractAbiFunctionNames<
        TAbi,
        "nonpayable" | "payable"
      >,
    >(
      transaction: ContractWriteTransaction<TAbi, TFunctionName>,
      options?: Partial<{
        chainId?: number;
        client?: TreasureClient;
        // Active wallet options
        wallet: Wallet<"smart">;
        // Backend wallet options
        backendWallet: string;
        includeAbi?: boolean;
      }>,
    ) => {
      const client = options?.client ?? treasure.client;
      const chainId = options?.chainId ?? treasure.chain.id;

      // Send transaction via backend if a backend wallet is provided
      if (options?.backendWallet) {
        return sendTransaction({
          client,
          chainId,
          backendWallet: options.backendWallet,
          includeAbi: options.includeAbi,
          transaction,
        });
      }

      // Send transaction via active smart wallet
      const wallet = options?.wallet ?? activeWallet;
      if (!wallet || !isSmartWallet(wallet)) {
        throw new Error("No smart wallet found");
      }

      return sendTransaction({
        client,
        chainId,
        wallet,
        transaction,
      });
    },
  };
};

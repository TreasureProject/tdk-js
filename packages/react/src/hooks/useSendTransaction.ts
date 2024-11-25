import {
  type ContractWriteTransaction,
  type TreasureConnectClient,
  isSmartWallet,
  sendTransaction,
} from "@treasure-dev/tdk-core";
import type { Abi, ExtractAbiFunctionNames } from "abitype";
import { useActiveWallet } from "thirdweb/react";
import type { Wallet } from "thirdweb/wallets";

import { useTreasure } from "../contexts/treasure";

export const useSendTransaction = () => {
  const { client, chain } = useTreasure();
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
      overrides?: Partial<{
        chainId: number;
        client: TreasureConnectClient;
        wallet: Wallet<"smart">;
      }>,
    ) => {
      const wallet = overrides?.wallet ?? activeWallet;
      if (!wallet || !isSmartWallet(wallet)) {
        throw new Error("No smart wallet found");
      }

      return sendTransaction({
        chainId: overrides?.chainId ?? chain.id,
        client: overrides?.client ?? client,
        wallet,
        transaction,
      });
    },
  };
};

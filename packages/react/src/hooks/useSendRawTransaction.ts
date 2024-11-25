import {
  type TreasureConnectClient,
  isSmartWallet,
  sendRawTransaction,
} from "@treasure-dev/tdk-core";
import { useActiveWallet } from "thirdweb/react";
import type { Wallet } from "thirdweb/wallets";

import { useTreasure } from "../contexts/treasure";

export const useSendRawTransaction = () => {
  const { client, chain } = useTreasure();
  const activeWallet = useActiveWallet();
  return {
    sendRawTransaction: (
      transaction: Parameters<typeof sendRawTransaction>[0]["transaction"],
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

      return sendRawTransaction({
        chainId: overrides?.chainId ?? chain.id,
        client: overrides?.client ?? client,
        wallet,
        transaction,
      });
    },
  };
};

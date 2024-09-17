import { privateKeyToAccount } from "thirdweb/wallets";

import type { TreasureConnectClient } from "../types";

export const generateAccountSignature = ({
  client,
  accountAddress,
  backendWalletPrivateKey,
}: {
  client: TreasureConnectClient;
  accountAddress: string;
  backendWalletPrivateKey: string;
}) =>
  privateKeyToAccount({
    client,
    privateKey: backendWalletPrivateKey,
  }).signMessage({
    message: JSON.stringify({ accountAddress }),
  });

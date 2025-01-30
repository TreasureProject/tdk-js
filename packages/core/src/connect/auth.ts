import type { KMSClientConfig } from "@aws-sdk/client-kms";
import { type Address, type Hex, defineChain } from "thirdweb";
import { verifyContractWalletSignature } from "thirdweb/auth";
import { smartWallet } from "thirdweb/wallets";
import { DEFAULT_ACCOUNT_FACTORY_V0_7 } from "thirdweb/wallets/smart";
import { hashMessage, recoverAddress } from "viem";

import type { TreasureConnectClient } from "../types";
import { getAwsKmsAccount } from "./kms";

type KmsOptions = {
  kmsKey: string;
  kmsClientConfig?: KMSClientConfig;
};

export const generateAccountSignature = async ({
  accountAddress,
  ...kmsOptions
}: {
  accountAddress: Address;
} & KmsOptions) => {
  const backendWalletAccount = await getAwsKmsAccount(kmsOptions);
  const expirationTime = Math.floor((Date.now() + 1000 * 60 * 15) / 1000); // 15 minutes
  return {
    backendWallet: backendWalletAccount.address,
    signature: await backendWalletAccount.signMessage({
      message: JSON.stringify({
        accountAddress: accountAddress.toLowerCase(),
        expirationTime,
      }),
    }),
    expirationTime,
  };
};

export const verifyAccountSignature = async ({
  accountAddress,
  signature,
  expirationTime,
}: { accountAddress: string; signature: Hex; expirationTime?: number }) => {
  if (
    expirationTime &&
    (Number.isNaN(expirationTime) || Date.now() > expirationTime * 1000)
  ) {
    throw new Error("Account signature expired");
  }

  return recoverAddress({
    hash: hashMessage(
      JSON.stringify({
        accountAddress: accountAddress.toLowerCase(),
        ...(expirationTime ? { expirationTime } : {}),
      }),
    ),
    signature,
  });
};

export const generateBackendWalletSignature = async ({
  client,
  chainId,
  ...kmsOptions
}: {
  client: TreasureConnectClient;
  chainId: number;
} & KmsOptions) => {
  const wallet = smartWallet({
    chain: defineChain(chainId),
    sponsorGas: true,
    factoryAddress: DEFAULT_ACCOUNT_FACTORY_V0_7,
  });

  const account = await wallet.connect({
    client,
    personalAccount: await getAwsKmsAccount(kmsOptions),
  });

  const expirationTime = Math.floor((Date.now() + 1000 * 60 * 15) / 1000); // 15 minutes
  return {
    backendWallet: account.address,
    signature: await account.signMessage({
      message: JSON.stringify({
        expirationTime,
      }),
    }),
    expirationTime,
  };
};

export const verifyBackendWalletSignature = async ({
  client,
  chainId,
  backendWallet,
  signature,
  expirationTime,
}: {
  client: TreasureConnectClient;
  chainId: number;
  backendWallet: Address;
  signature: Hex;
  expirationTime: number;
}) => {
  if (Date.now() > expirationTime * 1000) {
    throw new Error("Backend wallet signature expired");
  }

  const isValid = await verifyContractWalletSignature({
    client,
    chain: defineChain(chainId),
    message: JSON.stringify({ expirationTime }),
    signature,
    address: backendWallet,
  });
  if (!isValid) {
    throw new Error("Invalid backend wallet signature");
  }

  return backendWallet;
};

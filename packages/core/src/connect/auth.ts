import type { KMSClientConfig } from "@aws-sdk/client-kms";
import type { Hex } from "thirdweb";
import { hashMessage, isHex, recoverAddress } from "viem";

import { getAwsKmsAccount } from "./kms";

export const generateAccountSignature = async ({
  accountAddress,
  kmsKey,
  kmsClientConfig,
}: {
  accountAddress: string;
  kmsKey: string;
  kmsClientConfig?: KMSClientConfig;
}) => {
  const account = await getAwsKmsAccount({ kmsKey, kmsClientConfig });
  return account.signMessage({ message: JSON.stringify({ accountAddress }) });
};

export const verifyAccountSignature = async ({
  accountAddress,
  signature,
}: { accountAddress: string; signature: Hex }) => {
  const address = await recoverAddress({
    hash: hashMessage(
      JSON.stringify({
        accountAddress,
      }),
    ),
    signature,
  });
  return isHex(address) ? address : undefined;
};

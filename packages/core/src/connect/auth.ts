import type { KMSClientConfig } from "@aws-sdk/client-kms";
import type { Hex } from "thirdweb";
import { hashMessage, isHex, recoverAddress } from "viem";

import { getAwsKmsAccount } from "./kms";

const createMessage = ({ accountAddress }: { accountAddress: string }) =>
  JSON.stringify({ accountAddress: accountAddress.toLowerCase() });

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
  return account.signMessage({ message: createMessage({ accountAddress }) });
};

export const verifyAccountSignature = async ({
  accountAddress,
  signature,
}: { accountAddress: string; signature: Hex }) => {
  const address = await recoverAddress({
    hash: hashMessage(createMessage({ accountAddress })),
    signature,
  });
  return isHex(address) ? address : undefined;
};

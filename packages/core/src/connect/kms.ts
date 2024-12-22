// Ported from https://github.com/thirdweb-dev/engine/blob/main/src/server/utils/wallets/getAwsKmsAccount.ts
// TODO: remove when getAwsKmsAccount is ported to thirdweb package
import type { KMSClientConfig } from "@aws-sdk/client-kms";
import { KmsSigner } from "aws-kms-signer";
import type * as ox__TransactionEnvelopeEip2930 from "ox/TransactionEnvelopeEip2930";
import * as ox__TypedData from "ox/TypedData";
import type { Hex } from "thirdweb";
import { type Address, keccak256 } from "thirdweb";
import { serializeTransaction } from "thirdweb/transaction";
import { hashMessage } from "thirdweb/utils";
import type { Account } from "thirdweb/wallets";
import type { SignableMessage } from "viem";

type Options = {
  kmsKey: string;
  kmsClientConfig?: KMSClientConfig;
};

type SerializableTransaction = {
  type?: string | undefined;
  r?: Hex | bigint;
  s?: Hex | bigint;
  v?: bigint | number;
  yParity?: bigint | number;
  accessList?:
    | ox__TransactionEnvelopeEip2930.TransactionEnvelopeEip2930["accessList"]
    | undefined;
  chainId?: number | undefined;
  gasPrice?: bigint | undefined;
  maxFeePerGas?: bigint | undefined;
  maxPriorityFeePerGas?: bigint | undefined;
  data?: Hex | undefined;
  to?: string | null | undefined; // Must allow null for backwards compatibility
  nonce?: number | bigint | undefined;
  value?: bigint | undefined;
  gas?: bigint | undefined;
  gasLimit?: bigint | undefined;
};

export const getAwsKmsAccount = async ({
  kmsKey,
  kmsClientConfig,
}: Options): Promise<Account> => {
  const signer = new KmsSigner(kmsKey, kmsClientConfig);

  // Populate address immediately
  const addressUnprefixed = await signer.getAddress();
  const address = `0x${addressUnprefixed}` as Address;

  async function signTransaction(tx: SerializableTransaction): Promise<Hex> {
    const serializedTx = serializeTransaction({ transaction: tx });
    const txHash = keccak256(serializedTx);
    const signature = await signer.sign(Buffer.from(txHash.slice(2), "hex"));

    const r = `0x${signature.r.toString("hex")}` as Hex;
    const s = `0x${signature.s.toString("hex")}` as Hex;
    const v = BigInt(signature.v);

    const yParity: 0 | 1 = signature.v % 2 === 0 ? 1 : 0;

    const signedTx = serializeTransaction({
      transaction: tx,
      signature: {
        r,
        s,
        v,
        yParity,
      },
    });

    return signedTx;
  }

  /**
   * Sign a message with the account's private key.
   * If the message is a string, it will be prefixed with the Ethereum message prefix.
   * If the message is an object with a `raw` property, it will be signed as-is.
   */
  async function signMessage({
    message,
  }: {
    message: SignableMessage;
  }): Promise<Hex> {
    const messageHash = hashMessage(message);
    const signature = await signer.sign(
      Buffer.from(messageHash.slice(2), "hex"),
    );
    return `0x${signature.toString()}`;
  }

  async function signTypedData<
    const typedData extends ox__TypedData.TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | "EIP712Domain" = keyof typedData,
  >(
    _typedData: ox__TypedData.Definition<typedData, primaryType>,
  ): Promise<Hex> {
    const payload = ox__TypedData.getSignPayload(_typedData);
    const signature = await signer.sign(Buffer.from(payload.slice(2), "hex"));
    return `0x${signature.toString()}`;
  }

  async function sendTransaction(): Promise<{
    transactionHash: Hex;
  }> {
    throw new Error("Not implemented");
  }

  return {
    address,
    sendTransaction,
    signMessage,
    signTypedData,
    signTransaction,
  } satisfies Account;
};

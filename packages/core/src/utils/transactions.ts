import type { Abi, ExtractAbiFunctionNames } from "abitype";
import {
  type Hex,
  defineChain,
  getContract,
  prepareContractCall,
  prepareTransaction,
  sendAndConfirmTransaction,
} from "thirdweb";
import { isZkSyncChain } from "thirdweb/utils";
import type { Wallet } from "thirdweb/wallets";

import type {
  CreateRawTransactionBody,
  CreateRawTransactionReply,
  CreateTransactionBody,
  CreateTransactionReply,
  ReadTransactionReply,
} from "../../../../apps/api/src/schema";
import type {
  ContractWriteTransaction,
  TransactionOverrides,
  TreasureConnectClient,
} from "../types";
import { tdkApiGet, tdkApiPost } from "./api";

const getBackendTransactionDetails = async ({
  apiUri,
  queueId,
}: {
  apiUri: string;
  queueId: string;
}) => tdkApiGet<ReadTransactionReply>(`${apiUri}/transactions/${queueId}`);

const waitForBackendTransaction = async ({
  apiUri,
  queueId,
  maxRetries = 15,
  retryMs = 2_500,
  initialWaitMs = 4_000,
}: {
  apiUri: string;
  queueId: string;
  maxRetries?: number;
  retryMs?: number;
  initialWaitMs?: number;
}) => {
  let retries = 0;
  let transaction: ReadTransactionReply;
  do {
    await new Promise((r) =>
      setTimeout(r, retries === 0 ? initialWaitMs : retryMs),
    );
    transaction = await getBackendTransactionDetails({ apiUri, queueId });
    retries += 1;
  } while (
    retries < maxRetries &&
    transaction.status !== "errored" &&
    transaction.status !== "cancelled" &&
    transaction.status !== "mined"
  );

  if (transaction.status === "errored") {
    throw new Error(transaction.errorMessage || "Transaction error");
  }

  if (transaction.status === "cancelled") {
    throw new Error("Transaction cancelled");
  }

  if (transaction.status !== "mined") {
    throw new Error("Transaction timed out");
  }

  return { transactionHash: transaction.transactionHash };
};

const parseTransactionErrorMessage = (err: unknown) => {
  let message: string | undefined;

  if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "string") {
    message = err;
  } else if (typeof err === "object" && err !== null) {
    message = "message" in err ? (err.message as string) : JSON.stringify(err);
  }

  return message?.replace("execution reverted: ", "") ?? "Transaction error";
};

export const sendTransaction = async <
  TAbi extends Abi,
  TFunctionName extends ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable">,
>(
  params: {
    chainId: number;
    transaction: ContractWriteTransaction<TAbi, TFunctionName>;
  } & (
    | {
        // Active wallet transaction params
        client: TreasureConnectClient;
        wallet: Wallet<"smart">;
      }
    | {
        // Backend wallet transaction params
        apiUri: string;
        authToken: string;
        backendWallet: string;
        includeAbi?: boolean;
        accountAddress?: string;
        accountSignature?: string;
      }
  ),
) => {
  const chain = defineChain(params.chainId);
  const isUsingActiveWallet = "wallet" in params;

  // TODO: remove ZK check when sessions are supported
  if ((await isZkSyncChain(chain)) && !isUsingActiveWallet) {
    throw new Error("Wallet must be provided to use ZKsync chain");
  }

  if (isUsingActiveWallet) {
    const {
      client,
      wallet,
      transaction: { address, abi, functionName, args, overrides },
    } = params;

    if (!client) {
      throw new Error(
        "Treasure Connect client must be provided to use active wallet",
      );
    }

    if (wallet.getChain()?.id !== chain.id) {
      await wallet.switchChain(chain);
    }

    const account = wallet.getAccount();
    if (!account) {
      throw new Error("No accounts connected in wallet");
    }

    const contract = getContract({
      client,
      chain,
      address,
      abi,
    });

    // @ts-ignore: abitype and the Thirdweb SDK don't play well
    const transaction = prepareContractCall({
      contract,
      method: functionName,
      params: args,
      value: overrides?.value ? BigInt(overrides.value) : undefined,
      gas: overrides?.gas ? BigInt(overrides.gas) : undefined,
      maxFeePerGas: overrides?.maxFeePerGas
        ? BigInt(overrides.maxFeePerGas)
        : undefined,
      maxPriorityFeePerGas: overrides?.maxPriorityFeePerGas
        ? BigInt(overrides.maxPriorityFeePerGas)
        : undefined,
    });
    try {
      const receipt = await sendAndConfirmTransaction({
        account,
        transaction,
      });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }

      return {
        transactionHash: receipt.transactionHash,
      };
    } catch (err) {
      throw new Error(parseTransactionErrorMessage(err));
    }
  }

  const {
    apiUri,
    chainId,
    authToken,
    accountAddress,
    accountSignature,
    transaction,
    includeAbi,
  } = params;
  const { queueId } = await tdkApiPost<
    CreateTransactionBody,
    CreateTransactionReply
  >(
    `${apiUri}/transactions`,
    {
      ...transaction,
      // biome-ignore lint/suspicious/noExplicitAny: abitype and the API schema don't play well
      abi: includeAbi ? (transaction.abi as any) : undefined,
      // biome-ignore lint/suspicious/noExplicitAny: abitype and the API schema don't play well
      args: transaction.args as any,
    },
    {
      chainId,
      authToken,
      accountAddress,
      accountSignature,
    },
  );
  return waitForBackendTransaction({ apiUri, queueId });
};

export const sendRawTransaction = async (
  params: {
    chainId: number;
    transaction: {
      to: string;
      value?: bigint | string;
      data: string;
      overrides?: Partial<Omit<TransactionOverrides, "value">>;
    };
  } & (
    | {
        // Active wallet transaction params
        client: TreasureConnectClient;
        wallet: Wallet<"smart">;
      }
    | {
        // Backend wallet transaction params
        apiUri: string;
        authToken: string;
        backendWallet: string;
        accountAddress?: string;
        accountSignature?: string;
      }
  ),
) => {
  const chain = defineChain(params.chainId);
  const isUsingActiveWallet = "wallet" in params;

  // TODO: remove ZK check when sessions are supported
  if ((await isZkSyncChain(chain)) && !isUsingActiveWallet) {
    throw new Error("Wallet must be provided to use ZKsync chain");
  }

  if (isUsingActiveWallet) {
    const {
      client,
      wallet,
      transaction: { to, data, value, overrides },
    } = params;

    if (!client) {
      throw new Error(
        "Treasure Connect client must be provided to use active wallet",
      );
    }

    if (wallet.getChain()?.id !== chain.id) {
      await wallet.switchChain(chain);
    }

    const account = wallet.getAccount();
    if (!account) {
      throw new Error("No accounts connected in wallet");
    }

    const transaction = prepareTransaction({
      client,
      chain,
      to,
      data: data as Hex,
      value: value ? BigInt(value) : undefined,
      gas: overrides?.gas ? BigInt(overrides.gas) : undefined,
      maxFeePerGas: overrides?.maxFeePerGas
        ? BigInt(overrides.maxFeePerGas)
        : undefined,
      maxPriorityFeePerGas: overrides?.maxPriorityFeePerGas
        ? BigInt(overrides.maxPriorityFeePerGas)
        : undefined,
    });
    try {
      const receipt = await sendAndConfirmTransaction({
        account,
        transaction,
      });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }

      return { transactionHash: receipt.transactionHash };
    } catch (err) {
      throw new Error(parseTransactionErrorMessage(err));
    }
  }

  const {
    apiUri,
    chainId,
    authToken,
    accountAddress,
    accountSignature,
    transaction,
  } = params;
  const { queueId } = await tdkApiPost<
    CreateRawTransactionBody,
    CreateRawTransactionReply
  >(
    `${apiUri}/transactions`,
    {
      ...transaction,
      value: transaction.value?.toString(),
    },
    {
      chainId,
      authToken,
      accountAddress,
      accountSignature,
    },
  );
  return waitForBackendTransaction({ apiUri, queueId });
};

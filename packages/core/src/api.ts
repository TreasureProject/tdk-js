import type {
  Abi,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "abitype";

import {
  type Hex,
  defineChain,
  getContract,
  prepareContractCall,
  prepareTransaction,
  sendAndConfirmTransaction,
  toHex,
} from "thirdweb";
import { isZkSyncChain } from "thirdweb/utils";
import type { Wallet } from "thirdweb/wallets";
import type {
  CreateRawTransactionBody,
  CreateRawTransactionReply,
  CreateTransactionBody,
  CreateTransactionReply,
  ErrorReply,
  LoginBody,
  LoginReply,
  PoolReply,
  PoolsReply,
  ReadCurrentUserReply,
  ReadCurrentUserSessionsQuerystring,
  ReadCurrentUserSessionsReply,
  ReadHarvesterReply,
  ReadLoginPayloadQuerystring,
  ReadLoginPayloadReply,
  ReadProjectReply,
  ReadTransactionReply,
  ReadUserTransactionsQuerystring,
  ReadUserTransactionsReply,
  RouteReply,
  UpdateCurrentUserBody,
  UpdateCurrentUserReply,
} from "../../../apps/api/src/schema";
import type {
  AddLiquidityBody,
  RemoveLiquidityBody,
  RouteBody,
  SwapBody,
} from "../../../apps/api/src/schema/magicswap";
import { DEFAULT_TDK_API_BASE_URI, DEFAULT_TDK_CHAIN_ID } from "./constants";
import type { TreasureConnectClient } from "./types";

// @ts-expect-error: Patch BigInt for JSON serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};

class APIError extends Error {
  statusCode?: number;
}

export class TDKAPI {
  baseUri: string;
  chainId: number;
  backendWallet?: string;
  authToken?: string;
  client?: TreasureConnectClient;
  activeWallet?: Wallet;

  constructor({
    baseUri = DEFAULT_TDK_API_BASE_URI,
    chainId = DEFAULT_TDK_CHAIN_ID,
    backendWallet,
    authToken,
    client,
    activeWallet,
  }: {
    baseUri?: string;
    chainId?: number;
    backendWallet?: string;
    authToken?: string;
    client?: TreasureConnectClient;
    activeWallet?: Wallet;
  }) {
    this.baseUri = baseUri;
    this.chainId = chainId;
    this.backendWallet = backendWallet;
    this.authToken = authToken;
    this.client = client;
    this.activeWallet = activeWallet;
  }

  async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(this.baseUri + path, {
      ...options,
      headers: {
        ...(this.authToken
          ? { Authorization: `Bearer ${this.authToken}` }
          : undefined),
        ...(this.chainId
          ? { "x-chain-id": this.chainId.toString() }
          : undefined),
        ...options?.headers,
      },
    });
    const result = (await response.json()) as T | ErrorReply;
    if (response.status > 299) {
      const error = new APIError(
        result && typeof result === "object" && "error" in result
          ? result.error
          : "An unknown error occurred.",
      );
      error.statusCode = response.status;
      console.error(error);
      throw error;
    }

    return result as T;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number>,
    options?: RequestInit,
  ): Promise<T> {
    let pathWithParams = path;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const key in params) {
        searchParams.append(key, params[key]?.toString() ?? "");
      }

      pathWithParams += `?${searchParams}`;
    }

    return this.fetch(pathWithParams, options);
  }

  async post<T, U>(path: string, body?: T, options?: RequestInit): Promise<U> {
    return this.fetch<U>(path, {
      method: "POST",
      ...(body ? { body: JSON.stringify(body) } : undefined),
      ...options,
      headers: {
        "content-type": "application/json",
        ...options?.headers,
      },
    });
  }

  async put<T, U>(path: string, body?: T, options?: RequestInit): Promise<U> {
    return this.fetch<U>(path, {
      method: "PUT",
      ...(body ? { body: JSON.stringify(body) } : undefined),
      ...options,
      headers: {
        "content-type": "application/json",
        ...options?.headers,
      },
    });
  }

  setAuthToken(authToken: string) {
    this.authToken = authToken;
  }

  clearAuthToken() {
    this.authToken = undefined;
  }

  setActiveWallet(wallet: Wallet) {
    this.activeWallet = wallet;
  }

  clearActiveWallet() {
    this.activeWallet = undefined;
  }

  auth = {
    getLoginPayload: (params: ReadLoginPayloadQuerystring) =>
      this.get<ReadLoginPayloadReply>("/login/payload", params),
    logIn: (params: LoginBody) =>
      this.post<LoginBody, LoginReply>("/login", params),
  };

  project = {
    findBySlug: (slug: string) =>
      this.get<ReadProjectReply>(`/projects/${slug}`),
  };

  user = {
    me: ({ overrideAuthToken }: { overrideAuthToken?: string }) =>
      this.get<ReadCurrentUserReply>(
        "/users/me",
        undefined,
        overrideAuthToken
          ? {
              headers: {
                Authorization: overrideAuthToken,
              },
            }
          : undefined,
      ),
    update: (params: UpdateCurrentUserBody) =>
      this.put<UpdateCurrentUserBody, UpdateCurrentUserReply>(
        "/users/me",
        params,
      ),
    getSessions: (params: ReadCurrentUserSessionsQuerystring) =>
      this.get<ReadCurrentUserSessionsReply>("/users/me/sessions", params),
    getTransactions: (id: string, query?: ReadUserTransactionsQuerystring) =>
      this.get<ReadUserTransactionsReply>(`/users/${id}/transactions`, query),
  };

  transaction = {
    create: async <
      TAbi extends Abi,
      TFunctionName extends ExtractAbiFunctionNames<
        TAbi,
        "nonpayable" | "payable"
      >,
    >(
      params: Omit<CreateTransactionBody, "abi" | "functionName" | "args"> & {
        abi: TAbi;
        functionName:
          | TFunctionName
          | ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable">;
        args: AbiParametersToPrimitiveTypes<
          ExtractAbiFunction<TAbi, TFunctionName>["inputs"],
          "inputs"
        >;
      },
      options?: {
        includeAbi?: boolean;
        skipWaitForCompletion?: boolean;
        accountAddress?: string;
        accountSignature?: string;
        useActiveWallet?: boolean;
      },
    ) => {
      const chain = defineChain(this.chainId);
      // TODO: remove ZK check when sessions are supported
      if (options?.useActiveWallet || (await isZkSyncChain(chain))) {
        if (!this.client) {
          throw new Error("No Treasure Connect client set");
        }

        const account = this.activeWallet?.getAccount();
        if (!account) {
          throw new Error("No active wallet set");
        }

        const { address, abi, functionName, args, txOverrides } = params;
        const contract = getContract({
          client: this.client,
          chain,
          address,
          abi,
        });

        // @ts-ignore: abitype and the Thirdweb SDK don't play well
        const transaction = prepareContractCall({
          contract,
          method: functionName,
          params: args,
          value: txOverrides?.value ? BigInt(txOverrides.value) : undefined,
          gas: txOverrides?.gas ? BigInt(txOverrides.gas) : undefined,
          maxFeePerGas: txOverrides?.maxFeePerGas
            ? BigInt(txOverrides.maxFeePerGas)
            : undefined,
          maxPriorityFeePerGas: txOverrides?.maxPriorityFeePerGas
            ? BigInt(txOverrides.maxPriorityFeePerGas)
            : undefined,
        });
        const receipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });
        return {
          status: receipt.status === "success" ? "success" : "errored",
          transactionHash: receipt.transactionHash,
          errorMessage:
            receipt.status === "reverted" ? "Transaction reverted" : null,
        };
      }

      const result = await this.post<
        CreateTransactionBody,
        CreateTransactionReply
      >(
        "/transactions",
        {
          ...params,
          // biome-ignore lint/suspicious/noExplicitAny: abitype and the API schema don't play well
          ...(options?.includeAbi ? { abi: params.abi as any } : {}),
          // biome-ignore lint/suspicious/noExplicitAny: abitype and the API schema don't play well
          args: params.args as any,
          backendWallet: params.backendWallet ?? this.backendWallet,
        },
        {
          headers: {
            ...(options?.accountAddress
              ? { "x-account-address": options.accountAddress }
              : {}),
            ...(options?.accountSignature
              ? { "x-account-signature": options.accountSignature }
              : {}),
          },
        },
      );

      return options?.skipWaitForCompletion
        ? result
        : this.transaction.wait(result.queueId);
    },
    sendRaw: async (
      params: Omit<CreateRawTransactionBody, "value"> & {
        value?: bigint | string;
      },
      options?: {
        skipWaitForCompletion?: boolean;
        accountAddress?: string;
        accountSignature?: string;
        useActiveWallet?: boolean;
      },
    ) => {
      const chain = defineChain(this.chainId);
      // TODO: remove ZK check when sessions are supported
      if (options?.useActiveWallet || (await isZkSyncChain(chain))) {
        if (!this.client) {
          throw new Error("No Treasure Connect client set");
        }

        const account = this.activeWallet?.getAccount();
        if (!account) {
          throw new Error("No active wallet set");
        }

        const { to, data, value, txOverrides } = params;
        const transaction = prepareTransaction({
          client: this.client,
          chain,
          to,
          data: data as Hex,
          value: value ? BigInt(value) : undefined,
          gas: txOverrides?.gas ? BigInt(txOverrides.gas) : undefined,
          maxFeePerGas: txOverrides?.maxFeePerGas
            ? BigInt(txOverrides.maxFeePerGas)
            : undefined,
          maxPriorityFeePerGas: txOverrides?.maxPriorityFeePerGas
            ? BigInt(txOverrides.maxPriorityFeePerGas)
            : undefined,
        });
        const receipt = await sendAndConfirmTransaction({
          account,
          transaction,
        });
        return {
          status: receipt.status === "success" ? "success" : "errored",
          transactionHash: receipt.transactionHash,
          errorMessage:
            receipt.status === "reverted" ? "Transaction reverted" : null,
        };
      }

      const result = await this.post<
        CreateRawTransactionBody,
        CreateRawTransactionReply
      >(
        "/transactions/raw",
        {
          ...params,
          value: params.value ? toHex(BigInt(params.value)) : undefined,
          backendWallet: params.backendWallet ?? this.backendWallet,
        },
        {
          headers: {
            ...(options?.accountAddress
              ? { "x-account-address": options.accountAddress }
              : {}),
            ...(options?.accountSignature
              ? { "x-account-signature": options.accountSignature }
              : {}),
          },
        },
      );

      return options?.skipWaitForCompletion
        ? result
        : this.transaction.wait(result.queueId);
    },
    get: (queueId: string) =>
      this.get<ReadTransactionReply>(`/transactions/${queueId}`),
    wait: async (
      queueId: string,
      maxRetries = 15,
      retryMs = 2_500,
      initialWaitMs = 4_000,
    ) => {
      let retries = 0;
      let transaction: ReadTransactionReply;
      do {
        await new Promise((r) =>
          setTimeout(r, retries === 0 ? initialWaitMs : retryMs),
        );
        transaction = await this.transaction.get(queueId);
        retries += 1;
      } while (
        retries < maxRetries &&
        transaction.status !== "errored" &&
        transaction.status !== "cancelled" &&
        transaction.status !== "mined"
      );

      if (transaction.status === "errored") {
        throw new APIError(transaction.errorMessage || "Transaction error");
      }

      if (transaction.status === "cancelled") {
        throw new APIError("Transaction cancelled");
      }

      if (transaction.status !== "mined") {
        throw new APIError("Transaction timed out");
      }

      return transaction;
    },
  };

  harvester = {
    get: (id: string) => this.get<ReadHarvesterReply>(`/harvesters/${id}`),
  };

  magicswap = {
    getPools: () => this.get<PoolsReply>("/magicswap/pools"),
    getPool: (id: string) => this.get<PoolReply>(`/magicswap/pools/${id}`),
    getRoute: (body: RouteBody) =>
      this.post<RouteBody, RouteReply>("/magicswap/route", body),
    swap: async (body: SwapBody, waitForCompletion = true) => {
      const result = await this.post<SwapBody, CreateTransactionReply>(
        "/magicswap/swap",
        body,
      );
      return waitForCompletion ? this.transaction.wait(result.queueId) : result;
    },
    addLiquidity: async (
      poolId: string,
      body: AddLiquidityBody,
      waitForCompletion = true,
    ) => {
      const result = await this.post<AddLiquidityBody, CreateTransactionReply>(
        `/magicswap/pools/${poolId}/add-liquidity`,
        body,
      );
      return waitForCompletion ? this.transaction.wait(result.queueId) : result;
    },
    removeLiquidity: async (
      poolId: string,
      body: RemoveLiquidityBody,
      waitForCompletion = true,
    ) => {
      const result = await this.post<
        RemoveLiquidityBody,
        CreateTransactionReply
      >(`/magicswap/pools/${poolId}/remove-liquidity`, body);
      return waitForCompletion ? this.transaction.wait(result.queueId) : result;
    },
  };
}

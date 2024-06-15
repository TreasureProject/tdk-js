import type {
  Abi,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "abitype";

import type {
  CreateTransactionBody,
  LoginBody,
  LoginReply,
  ReadCurrentUserSessionsQuerystring,
  ReadCurrentUserSessionsReply,
  ReadLoginPayloadReply,
} from "../../../apps/api/src/schema";
import type {
  CreateTransactionReply,
  ErrorReply,
  ReadCurrentUserReply,
  ReadHarvesterReply,
  ReadLoginPayloadQuerystring,
  ReadProjectReply,
  ReadTransactionReply,
} from "../../../apps/api/src/schema";
import { DEFAULT_TDK_API_BASE_URI, DEFAULT_TDK_CHAIN_ID } from "./constants";

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

  constructor({
    baseUri = DEFAULT_TDK_API_BASE_URI,
    chainId = DEFAULT_TDK_CHAIN_ID,
    backendWallet,
    authToken,
  }: {
    baseUri?: string;
    chainId?: number;
    backendWallet?: string;
    authToken?: string;
  }) {
    this.baseUri = baseUri;
    this.chainId = chainId;
    this.backendWallet = backendWallet;
    this.authToken = authToken;
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
        searchParams.append(key, params[key].toString());
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

  setAuthToken(authToken: string) {
    this.authToken = authToken;
  }

  clearAuthToken() {
    this.authToken = undefined;
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
    me: () => this.get<ReadCurrentUserReply>("/users/me"),
    getSessions: (params: ReadCurrentUserSessionsQuerystring) =>
      this.get<ReadCurrentUserSessionsReply>("/users/me/sessions", params),
  };

  transaction = {
    create: async <
      TAbi extends Abi,
      TFunctionName extends ExtractAbiFunctionNames<
        TAbi,
        "nonpayable" | "payable"
      >,
    >(
      params: {
        address: string;
        abi: TAbi;
        functionName:
          | TFunctionName
          | ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable">;
        args: AbiParametersToPrimitiveTypes<
          ExtractAbiFunction<TAbi, TFunctionName>["inputs"],
          "inputs"
        >;
        backendWallet?: string;
      },
      options: { waitForCompletion?: boolean } = { waitForCompletion: true },
    ) => {
      const result = await this.post<
        CreateTransactionBody,
        CreateTransactionReply
      >("/transactions", {
        ...params,
        // biome-ignore lint/suspicious/noExplicitAny: abitype and the API schema don't play well
        abi: params.abi as any,
        // biome-ignore lint/suspicious/noExplicitAny: abitype and the API schema don't play well
        args: params.args as any,
        backendWallet: params.backendWallet ?? this.backendWallet,
      });
      if (!options.waitForCompletion) {
        return result;
      }

      let retries = 0;
      let transaction: ReadTransactionReply;
      do {
        if (retries > 0) {
          await new Promise((r) => setTimeout(r, 2_500));
        }

        transaction = await this.transaction.get(result.queueId);
        retries += 1;
      } while (
        retries < 15 &&
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
    get: (queueId: string) =>
      this.get<ReadTransactionReply>(`/transactions/${queueId}`),
  };

  harvester = {
    get: (id: string) => this.get<ReadHarvesterReply>(`/harvesters/${id}`),
  };
}

import type {
  Abi,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "abitype";

import type {
  AuthenciateBody,
  AuthenticateReply,
  CreateTransactionReply,
  ErrorReply,
  ReadCurrentUserReply,
  ReadHarvesterReply,
  ReadProjectReply,
  ReadTransactionReply,
} from "../../../apps/api/src/schema";
import {
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_APP,
  DEFAULT_TDK_CHAIN_ID,
} from "./constants";

// @ts-expect-error: Patch BigInt for JSON serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export class APIError extends Error {
  statusCode?: number;
}

export class TDKAPI {
  baseUri: string;
  projectId: string;
  chainId: number;
  authToken?: string;

  constructor({
    baseUri = DEFAULT_TDK_API_BASE_URI,
    project = DEFAULT_TDK_APP,
    chainId = DEFAULT_TDK_CHAIN_ID,
    authToken,
  }: {
    baseUri?: string;
    project?: string;
    chainId?: number;
    authToken?: string;
  }) {
    this.baseUri = baseUri;
    this.projectId = project;
    this.chainId = chainId;
    this.authToken = authToken;
  }

  async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(this.baseUri + path, {
      ...options,
      headers: {
        ...(this.authToken
          ? { Authorization: `Bearer ${this.authToken}` }
          : undefined),
        ...(this.projectId ? { "x-project-id": this.projectId } : undefined),
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
    params?: Record<string, string>,
    options?: RequestInit,
  ): Promise<T> {
    let pathWithParams = path;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const key in params) {
        searchParams.append(key, params[key]);
      }

      pathWithParams += `?${searchParams}`;
    }

    return this.fetch(pathWithParams, options);
  }

  async post<T>(
    path: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.fetch<T>(path, {
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
    authenticate: (params: AuthenciateBody) =>
      this.post<AuthenticateReply>(`/auth/authenticate`, params),
  };

  project = {
    findBySlug: (slug: string) =>
      this.get<ReadProjectReply>(`/projects/${slug}`),
  };

  user = {
    me: () => this.get<ReadCurrentUserReply>("/users/me"),
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
      },
      options: { waitForCompletion?: boolean } = { waitForCompletion: true },
    ) => {
      const result = await this.post<CreateTransactionReply>(
        `/transactions`,
        params,
      );
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

      if (transaction.status == "errored") {
        throw new APIError(transaction.errorMessage || "Transaction error");
      }

      if (transaction.status == "cancelled") {
        throw new APIError("Transaction cancelled");
      }

      if (transaction.status != "mined") {
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

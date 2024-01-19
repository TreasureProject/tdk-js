import type {
  Abi,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "abitype";

import type { WriteContractReply } from "./routes/contracts";
import type { ReadProjectReply } from "./routes/projects";
import type { ErrorReply } from "./utils/schema";

// @ts-expect-error: Patch BigInt for JSON serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export class APIError extends Error {
  statusCode?: number;
}

export class TDKAPI {
  baseUri: string;
  authToken?: string;
  projectId?: string;
  chainId?: number;

  constructor(options: {
    baseUri: string;
    authToken?: string;
    projectId?: string;
    chainId?: number;
  }) {
    const { baseUri, authToken, projectId, chainId } = options;
    this.baseUri = baseUri;
    this.authToken = authToken;
    this.projectId = projectId;
    this.chainId = chainId;
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

  project = {
    findBySlug: (slug: string) =>
      this.get<ReadProjectReply>(`/projects/${slug}`),
  };

  contract = {
    write: <
      TAbi extends Abi,
      TFunctionName extends ExtractAbiFunctionNames<
        TAbi,
        "nonpayable" | "payable"
      >,
    >(
      address: string,
      {
        functionName,
        args,
      }: {
        abi: TAbi;
        functionName:
          | TFunctionName
          | ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable">;
        args: AbiParametersToPrimitiveTypes<
          ExtractAbiFunction<TAbi, TFunctionName>["inputs"],
          "inputs"
        >;
      },
    ) =>
      this.post<WriteContractReply>(`/contracts/${address}`, {
        functionName,
        args,
      }),
  };
}

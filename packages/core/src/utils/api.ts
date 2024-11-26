import type { ErrorReply } from "../../../../apps/api/src/schema";
import { DEFAULT_TDK_API_BASE_URI } from "../constants";

// @ts-expect-error: Patch BigInt for JSON serialization
BigInt.prototype.toJSON = function () {
  return this.toString();
};

type Options = RequestInit &
  Partial<{
    authToken: string;
    chainId: number;
    accountAddress: string;
    accountSignature: string;
  }>;

export const createApiClient = ({
  baseUri = DEFAULT_TDK_API_BASE_URI,
  authToken,
}: { baseUri?: string; authToken?: string }) => {
  const customFetch = async <T>(
    path: string,
    options?: Options,
  ): Promise<T> => {
    const response = await fetch(baseUri + path, {
      ...options,
      headers: {
        ...((options?.authToken ?? authToken)
          ? { Authorization: `Bearer ${options?.authToken ?? authToken}` }
          : undefined),
        ...(options?.chainId
          ? { "x-chain-id": options.chainId.toString() }
          : undefined),
        ...(options?.accountAddress
          ? { "x-account-address": options.accountAddress }
          : {}),
        ...(options?.accountSignature
          ? { "x-account-signature": options.accountSignature }
          : {}),
        ...options?.headers,
      },
    });
    const result = (await response.json()) as T | ErrorReply;
    if (response.status > 299) {
      throw new Error(
        result && typeof result === "object" && "error" in result
          ? result.error
          : "An unknown error occurred.",
      );
    }

    return result as T;
  };

  return {
    get: async <T>(
      path: string,
      params?: Record<string, string | number>,
      options?: Options,
    ): Promise<T> => {
      let pathWithParams = path;
      if (params) {
        const searchParams = new URLSearchParams();
        for (const key in params) {
          searchParams.append(key, params[key]?.toString() ?? "");
        }

        pathWithParams += `?${searchParams}`;
      }

      return customFetch(pathWithParams, options);
    },
    post: async <T, U>(
      path: string,
      body?: T,
      options?: Options,
    ): Promise<U> => {
      return customFetch<U>(path, {
        method: "POST",
        body: JSON.stringify(body),
        ...options,
        headers: {
          "content-type": "application/json",
          ...options?.headers,
        },
      });
    },
    put: async <T, U>(
      path: string,
      body?: T,
      options?: Options,
    ): Promise<U> => {
      return customFetch<U>(path, {
        method: "PUT",
        body: JSON.stringify(body),
        ...options,
        headers: {
          "content-type": "application/json",
          ...options?.headers,
        },
      });
    },
  };
};

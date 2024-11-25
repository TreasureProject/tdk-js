import type { ErrorReply } from "../../../../apps/api/src/schema";

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

const tdkApiFetch = async <T>(uri: string, options?: Options): Promise<T> => {
  const response = await fetch(uri, {
    ...options,
    headers: {
      ...(options?.authToken
        ? { Authorization: `Bearer ${options.authToken}` }
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

export const tdkApiGet = async <T>(
  uri: string,
  params?: Record<string, string | number>,
  options?: Options,
): Promise<T> => {
  let uriWithParams = uri;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const key in params) {
      searchParams.append(key, params[key]?.toString() ?? "");
    }

    uriWithParams += `?${searchParams}`;
  }

  return tdkApiFetch(uriWithParams, options);
};

export const tdkApiPost = async <T, U>(
  uri: string,
  body?: T,
  options?: Options,
): Promise<U> => {
  return tdkApiFetch<U>(uri, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
    headers: {
      "content-type": "application/json",
      ...options?.headers,
    },
  });
};

// export const tdkApiPut = async <T, U>(
//   uri: string,
//   body?: T,
//   options?: Options,
// ): Promise<U> => {
//   return tdkApiFetch<U>(uri, {
//     method: "PUT",
//     body: JSON.stringify(body),
//     ...options,
//     headers: {
//       "content-type": "application/json",
//       ...options?.headers,
//     },
//   });
// };

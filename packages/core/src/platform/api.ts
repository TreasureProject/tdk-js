import { PLATFORM_API_BASE_URI } from "../constants";
import type { AccountDomains } from "./types";

type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

interface JSONObject {
  [x: string]: JSONValue;
}

type JSONArray = Array<JSONValue>;

type APIErrorResponse = {
  errorMessage?: string;
};

export class APIError extends Error {
  statusCode?: number;
}

export class PlatformAPIClient {
  baseUri: string;
  apiKey: string | undefined;

  constructor(baseUri = PLATFORM_API_BASE_URI, apiKey?: string) {
    this.baseUri = baseUri;
    this.apiKey = apiKey;
  }

  async fetch<T extends object>(
    path: string,
    options?: RequestInit,
  ): Promise<T> {
    const response = await fetch(this.baseUri + path, {
      ...options,
      headers: {
        ...(this.apiKey ? { "x-api-key": this.apiKey } : undefined),
        ...options?.headers,
      },
    });
    const result = (await response.json()) as T | APIErrorResponse;
    if (response.status > 299) {
      const error = new APIError(
        "errorMessage" in result
          ? result.errorMessage
          : "An unknown error occurred.",
      );
      error.statusCode = response.status;
      console.error(error);
      throw error;
    }

    return result as T;
  }

  async get<T extends object>(
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

  async post<T extends object>(
    path: string,
    params: JSONValue,
    options?: RequestInit,
  ): Promise<T> {
    return this.fetch<T>(path, {
      method: "POST",
      body: JSON.stringify(params),
      ...options,
      headers: {
        "content-type": "application/json",
        ...options?.headers,
      },
    });
  }

  async getAccountDomains(address: string) {
    return this.get<AccountDomains>(`/domain/${address}`);
  }
}

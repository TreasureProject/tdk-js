import type { ErrorReply, ReadProjectReply } from "./types";

type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

interface JSONObject {
  [x: string]: JSONValue;
}

type JSONArray = Array<JSONValue>;

export class APIError extends Error {
  statusCode?: number;
}

export class TDKAPI {
  baseUri: string;
  apiKey?: string;

  constructor(baseUri: string, apiKey?: string) {
    this.baseUri = baseUri;
    this.apiKey = apiKey;
  }

  async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(this.baseUri + path, {
      ...options,
      headers: {
        ...(this.apiKey ? { "x-api-key": this.apiKey } : undefined),
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

  async getProjectBySlug(slug: string) {
    return this.get<ReadProjectReply>(`/projects/${slug}`);
  }
}

import * as Sentry from "@sentry/node";
import { ApiError } from "@thirdweb-dev/engine";

export const TDK_ERROR_NAMES = {
  AuthError: "AuthError",
  HarvesterError: "HarvesterError",
  MagicswapError: "MagicswapError",
  ProjectError: "ProjectError",
  TransactionError: "TransactionError",
  UserError: "UserError",
} as const;

export const TDK_ERROR_CODES = {
  MAINTENANCE_MODE_ENABLED: "MAINTENANCE_MODE_ENABLED",
  AUTH_UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  HARVESTER_NFT_HANDLER_NOT_FOUND: "HARVESTER_NFT_HANDLER_NOT_FOUND",
  MAGICSWAP_SWAP_FAILED: "MAGICSWAP_SWAP_FAILED",
  PROJECT_NOT_FOUND: "PROJECT_NOT_FOUND",
  TRANSACTION_CREATE_FAILED: "TRANSACTION_CREATE_FAILED",
  TRANSACTION_READ_FAILED: "TRANSACTION_READ_FAILED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
};

export class TdkError extends Error {
  code: string | undefined;
  statusCode: number | undefined;
  data: object | undefined;

  constructor({
    name,
    code,
    message,
    statusCode,
    data,
  }: {
    name: string;
    code: string;
    message: string;
    statusCode?: number;
    data?: object;
  }) {
    super(message);
    this.name = name;
    this.code = code;
    this.statusCode = statusCode;
    this.data = data;
    Sentry.setExtra("error", this);
  }
}

export const parseEngineErrorMessage = (err: ApiError | Error) => {
  if (err instanceof ApiError && err.body.error?.message) {
    return err.body.error.message as string;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return undefined;
};

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
  MAGICSWAP_POOL_NOT_FOUND: "MAGICSWAP_POOL_NOT_FOUND",
  MAGICSWAP_SWAP_FAILED: "MAGICSWAP_SWAP_FAILED",
  MAGICSWAP_ADD_LIQUIDITY_FAILED: "MAGICSWAP_ADD_LIQUIDITY_FAILED",
  MAGICSWAP_REMOVE_LIQUIDITY_FAILED: "MAGICSWAP_REMOVE_LIQUIDITY_FAILED",
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

const ENGINE_ERROR_MESSAGE_MAP = {
  "Invalid UserOperation signature or paymaster signature":
    "No active session found. Please sign in again.",
} as const;

export const normalizeEngineErrorMessage = (rawMessage: string) => {
  const groups =
    /(?:reason: '(.*?)' at)|(?:reason="execution reverted: (.*?)")|(?:eth_sendUserOperation error: {"message":"(.*?)"|(?:Simulation failed: TransactionError: Error - (.*))|(?:^Simulation failed: (.*))|(?:^Error - (.*)))/gi.exec(
      rawMessage,
    );
  const message = groups?.slice(1).find((group) => group) ?? rawMessage;
  return message in ENGINE_ERROR_MESSAGE_MAP
    ? ENGINE_ERROR_MESSAGE_MAP[message as keyof typeof ENGINE_ERROR_MESSAGE_MAP]
    : message;
};

export const parseEngineErrorMessage = (err: unknown) => {
  let message: string | undefined;

  if (err instanceof ApiError && err.body.error?.message) {
    message = err.body.error.message;
  } else if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "string") {
    message = err;
  }

  return message ? normalizeEngineErrorMessage(message) : "Unknown error";
};

export const throwUnauthorizedError = (message: string) => {
  throw new TdkError({
    name: TDK_ERROR_NAMES.AuthError,
    code: TDK_ERROR_CODES.AUTH_UNAUTHORIZED,
    message: "Unauthorized",
    data: { authError: message },
  });
};

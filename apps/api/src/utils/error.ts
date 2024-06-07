import * as Sentry from "@sentry/node";

type ErrorCode =
  | "TDK_UNAUTHORIZED"
  | "TDK_FORBIDDEN"
  | "TDK_NOT_FOUND"
  | "TDK_CREATE_TRANSACTION"
  | "TDK_READ_TRANSACTION";

const ERROR_STATUS_CODE_MAPPING: Partial<Record<ErrorCode, number>> = {
  TDK_UNAUTHORIZED: 401,
  TDK_FORBIDDEN: 403,
  TDK_NOT_FOUND: 404,
};

export class TdkError extends Error {
  code: ErrorCode;
  statusCode: number;
  data: object | undefined;

  constructor({
    code,
    message,
    statusCode,
    data,
  }: {
    code: ErrorCode;
    message: string;
    statusCode?: number;
    data?: object;
  }) {
    super(message);
    this.name = "TdkError";
    this.code = code;
    this.statusCode = statusCode ?? ERROR_STATUS_CODE_MAPPING[code] ?? 500;
    this.data = data;
    Sentry.setExtra("error", this);
  }
}

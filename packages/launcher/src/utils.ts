import type { WalletComponents } from "./types";

export function getTreasureLauncherAuthToken(): string | undefined {
  let args: string[] | undefined;

  if (typeof process !== "undefined" && Array.isArray(process.argv)) {
    args = process.argv;
  } else if (
    typeof window !== "undefined" &&
    window.process &&
    Array.isArray(window.process.argv)
  ) {
    args = window.process.argv;
  } else {
    return undefined;
  }

  const arg = args.find((arg) => arg.startsWith("--tdk-auth-token="));
  return arg ? arg.split("=")[1] : undefined;
}

export function isUsingTreasureLauncher(): boolean {
  return !!getTreasureLauncherAuthToken();
}

export function getTreasureLauncherWalletComponents():
  | WalletComponents
  | undefined {
  let args: string[] | undefined;

  if (typeof process !== "undefined" && Array.isArray(process.argv)) {
    args = process.argv;
  } else if (
    typeof window !== "undefined" &&
    window.process &&
    Array.isArray(window.process.argv)
  ) {
    args = window.process.argv;
  } else {
    return undefined;
  }

  let walletId: string | undefined = args.find((arg) =>
    arg.startsWith("--tdk-wallet-id="),
  );
  if (walletId) {
    walletId = walletId.split("=")[1];
  }

  let authProvider: string | undefined = args.find((arg) =>
    arg.startsWith("--tdk-auth-provider="),
  );
  if (authProvider) {
    authProvider = authProvider.split("=")[1];
  }

  let authCookie: string | undefined = args.find((arg) =>
    arg.startsWith("--tdk-auth-cookie="),
  );
  if (authCookie) {
    authCookie = authCookie.split("=")[1];
  }

  if (!walletId || !authProvider || !authCookie) {
    return undefined;
  }

  return {
    walletId,
    authProvider,
    authCookie,
  };
}

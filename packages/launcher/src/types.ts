export type WalletComponents = {
  walletId: string;
  authProvider: string;
  authCookie: string;
};

export type LauncherOptions = {
  getAuthTokenOverride?: () => string | undefined;
  getWalletComponentsOverride?: () => WalletComponents | undefined;
  getPort?: () => number;
};

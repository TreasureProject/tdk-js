import type { Wallet, WalletId } from "thirdweb/wallets";

export const isSmartWallet = (
  wallet: Wallet<WalletId>,
): wallet is Wallet<"smart"> => wallet.id === "smart";

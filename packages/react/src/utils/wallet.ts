import { InAppWalletAuth } from "thirdweb/wallets";

export const SUPPORTED_WALLETS: InAppWalletAuth[] = [
  "email",
  "google",
  "apple",
  "discord",
  "farcaster",
  "telegram",
  "passkey",
  "phone",
];

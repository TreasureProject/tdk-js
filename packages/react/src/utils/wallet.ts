import { inAppWallet } from "thirdweb/wallets";

export const SUPPORTED_WALLETS = [
  inAppWallet({
    auth: {
      options: [
        "email",
        "google",
        "apple",
        "discord",
        "farcaster",
        "passkey",
        "phone",
      ],
    },
  }),
];

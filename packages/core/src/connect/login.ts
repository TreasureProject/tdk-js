import { createThirdwebClient, defineChain } from "thirdweb";
import { signLoginPayload } from "thirdweb/auth";
import {
  type Wallet,
  ecosystemWallet as createEcosystemWallet,
  smartWallet as createSmartWallet,
  createWallet,
  preAuthenticate,
} from "thirdweb/wallets";
import { hasStoredPasskey } from "thirdweb/wallets/in-app";

import { TDKAPI } from "../api";
import {
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_CHAIN_ID,
  DEFAULT_TDK_ECOSYSTEM_ID,
} from "../constants";
import type {
  ConnectConfig,
  EcosystemIdString,
  TreasureConnectClient,
} from "../types";
import { getContractAddress } from "../utils/contracts";
import { startUserSession } from "./session";

const SUPPORTED_SOCIAL_OPTIONS = [
  "google",
  "apple",
  "discord",
  "telegram",
  "x",
] as const;

export const SUPPORTED_WEB3_WALLETS: Wallet[] = [
  createWallet("io.metamask"),
  createWallet("walletConnect"),
  createWallet("io.rabby"),
  createWallet("com.brave.wallet"),
  createWallet("me.rainbow"),
  createWallet("global.safe"),
  createWallet("com.ledger"),
];

export type SocialConnectMethod = (typeof SUPPORTED_SOCIAL_OPTIONS)[number];

export type ConnectMethod =
  | (typeof SUPPORTED_SOCIAL_OPTIONS)[number]
  | "email"
  | "passkey"
  | "wallet"
  | "auth_endpoint";

type ConnectWalletConfig = {
  client: TreasureConnectClient;
  ecosystemId?: EcosystemIdString;
  ecosystemPartnerId: string;
  chainId?: number;
  authMode?: "popup" | "redirect" | "window";
  redirectUrl?: string;
} & (
  | {
      method: SocialConnectMethod;
    }
  | {
      method: "email";
      email: string;
      verificationCode: string;
    }
  | {
      method: "passkey";
      passkeyName?: string;
      hasStoredPasskey?: boolean;
    }
  | {
      method: "auth_endpoint";
      payload: string;
    }
);

export const isSocialConnectMethod = (method: ConnectMethod) =>
  SUPPORTED_SOCIAL_OPTIONS.includes(method as SocialConnectMethod);

export const connectEcosystemWallet = async (params: ConnectWalletConfig) => {
  const {
    client,
    ecosystemId = DEFAULT_TDK_ECOSYSTEM_ID,
    ecosystemPartnerId,
    chainId = DEFAULT_TDK_CHAIN_ID,
    authMode,
    redirectUrl,
  } = params;
  const chain = defineChain(chainId);

  const wallet = createEcosystemWallet(ecosystemId, {
    partnerId: ecosystemPartnerId,
    auth: {
      mode: authMode,
      redirectUrl,
    },
  });

  if (params.method === "email") {
    // Connect with email
    const { email, verificationCode } = params;
    await wallet.connect({
      client,
      chain,
      strategy: "email",
      email: email.toLowerCase(),
      verificationCode,
    });
  } else if (params.method === "passkey") {
    // Connect with passkey
    const hasPasskey =
      params.hasStoredPasskey ?? (await hasStoredPasskey(client));
    await wallet.connect({
      client,
      chain,
      strategy: "passkey",
      type: hasPasskey ? "sign-in" : "sign-up",
      passkeyName: params.passkeyName,
    });
  } else if (params.method === "auth_endpoint") {
    // Connect with auth endpoint
    await wallet.connect({
      client,
      chain,
      strategy: "auth_endpoint",
      payload: params.payload,
      encryptionKey: "any", // Unused with enclave ecosystem wallets
    });
  } else {
    // Connect with social
    await wallet.connect({
      client,
      chain,
      strategy: params.method,
    });
  }

  return wallet;
};

export const connectWallet = async (params: ConnectWalletConfig) => {
  const ecosystemWallet = await connectEcosystemWallet(params);
  const account = await ecosystemWallet.getAccount();
  if (!account) {
    throw new Error("Ecosystem wallet account not found");
  }

  const chain = defineChain(params.chainId ?? DEFAULT_TDK_CHAIN_ID);
  const smartWallet = createSmartWallet({
    chain,
    factoryAddress: getContractAddress(chain.id, "ManagedAccountFactory"),
    sponsorGas: true,
  });

  await smartWallet.connect({
    client: params.client,
    personalAccount: account,
  });

  return smartWallet;
};

export const createTreasureConnectClient = ({
  clientId,
}: { clientId: string }): TreasureConnectClient =>
  createThirdwebClient({ clientId });

export const authenticateWallet = async ({
  wallet,
  tdk,
}: {
  wallet: Wallet;
  tdk: TDKAPI;
}) => {
  const account = wallet.getAccount();
  if (!account) {
    throw new Error("Wallet account not found");
  }

  // Generate login payload for user
  console.debug("[TDK] Generating login payload");
  const payload = await tdk.auth.getLoginPayload({
    address: account.address,
  });

  // Sign generated payload
  console.debug("[TDK] Signing login payload");
  const signedPayload = await signLoginPayload({
    payload,
    account,
  });

  // Log in with signed payload
  console.debug("[TDK] Logging in with signed payload");
  return tdk.auth.logIn(signedPayload);
};

export const sendEmailVerificationCode = async ({
  client,
  ecosystemId = DEFAULT_TDK_ECOSYSTEM_ID,
  ecosystemPartnerId,
  email,
}: {
  client: TreasureConnectClient;
  ecosystemId?: EcosystemIdString;
  ecosystemPartnerId: string;
  email: string;
}) =>
  preAuthenticate({
    client,
    ecosystem: {
      id: ecosystemId,
      partnerId: ecosystemPartnerId,
    },
    strategy: "email",
    email: email.toLowerCase(),
  });

export const logIn = async (params: ConnectWalletConfig & ConnectConfig) => {
  const {
    client,
    chainId = DEFAULT_TDK_CHAIN_ID,
    apiUri = DEFAULT_TDK_API_BASE_URI,
    sessionOptions,
    ...connectWalletParams
  } = params;

  const wallet = await connectWallet({
    client,
    chainId,
    ...connectWalletParams,
  });

  const tdk = new TDKAPI({
    baseUri: apiUri,
    chainId,
    backendWallet: sessionOptions?.backendWallet,
    client,
  });

  const { token, user } = await authenticateWallet({
    wallet,
    tdk,
  });

  // Set auth token and wallet on TDK so they can be used in future requests
  tdk.setAuthToken(token as string);
  tdk.setActiveWallet(wallet);

  // Start user session if configured
  if (sessionOptions) {
    await startUserSession({
      client,
      wallet,
      chainId,
      tdk,
      sessions: user.sessions,
      options: sessionOptions,
    });
  }

  return { token, user, tdk };
};

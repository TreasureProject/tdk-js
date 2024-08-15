import { createThirdwebClient, defineChain } from "thirdweb";
import { signLoginPayload } from "thirdweb/auth";
import type { Wallet } from "thirdweb/wallets";
import {
  hasStoredPasskey,
  inAppWallet,
  preAuthenticate,
} from "thirdweb/wallets/in-app";

import { TDKAPI } from "../api";
import { DEFAULT_TDK_API_BASE_URI, DEFAULT_TDK_CHAIN_ID } from "../constants";
import type {
  ConnectConfig,
  SocialConnectMethod,
  TreasureConnectClient,
} from "../types";
import { getContractAddress } from "../utils/contracts";
import { startUserSession } from "./session";

type ConnectWalletConfig = {
  client: TreasureConnectClient;
  chainId?: number;
} & (
  | {
      mode: SocialConnectMethod;
      redirectUrl?: string;
      redirectExternally?: string;
    }
  | {
      mode: "email";
      email: string;
      verificationCode: string;
    }
  | {
      mode: "passkey";
      passkeyName?: string;
      domain?: {
        displayName: string;
        hostname: string;
      };
    }
);

export const connectWallet = async (params: ConnectWalletConfig) => {
  const { client, chainId = DEFAULT_TDK_CHAIN_ID } = params;
  const chain = defineChain(chainId);

  const wallet = inAppWallet({
    smartAccount: {
      chain,
      factoryAddress: getContractAddress(chain.id, "ManagedAccountFactory"),
      sponsorGas: true,
    },
  });

  if (params.mode === "email") {
    const { email, verificationCode } = params;
    await wallet.connect({
      client,
      chain,
      strategy: "email",
      email,
      verificationCode,
    });
  } else if (params.mode === "passkey") {
    const { passkeyName, domain } = params;
    const hasPasskey = await hasStoredPasskey(client);
    await wallet.connect({
      client,
      chain,
      strategy: "passkey",
      type: hasPasskey ? "sign-in" : "sign-up",
      passkeyName,
      domain,
    });
  } else {
    await wallet.connect({
      client,
      chain,
      strategy: params.mode,
      redirectUrl: params.redirectUrl,
      // redirectExternally: params.redirectExternally,
    });
  }

  return wallet;
};

export const createLoginUrl = ({
  project,
  chainId,
  domain,
  redirectUri,
  data,
}: {
  project: string;
  chainId: number;
  domain: string;
  redirectUri: string;
  data?: string;
}) =>
  `${domain}/${project}?redirect_uri=${redirectUri}&chain_id=${chainId}${
    data ? `&data=${data}` : ""
  }`;

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
  email,
}: {
  client: TreasureConnectClient;
  email: string;
}) =>
  preAuthenticate({
    client,
    strategy: "email",
    email,
  });

export const logIn = async (params: ConnectWalletConfig & ConnectConfig) => {
  const {
    client,
    chainId = DEFAULT_TDK_CHAIN_ID,
    apiUri = DEFAULT_TDK_API_BASE_URI,
    sessionOptions,
    ...connectWalletParams
  } = params;

  const wallet = await connectWallet({ client, ...connectWalletParams });

  const tdk = new TDKAPI({
    baseUri: apiUri,
    chainId,
    backendWallet: sessionOptions?.backendWallet,
  });

  const { token, user } = await authenticateWallet({
    wallet,
    tdk,
  });

  // Set auth token on TDK so it's used in future requests
  tdk.setAuthToken(token as string);

  // Start user session if configured
  if (sessionOptions) {
    await startUserSession({
      client,
      wallet,
      chainId,
      tdk,
      options: sessionOptions,
    });
  }

  return { token, user, tdk };
};

export const logInWithEmail = async ({
  email,
  verificationCode,
  ...rest
}: {
  client: TreasureConnectClient;
  email: string;
  verificationCode: string;
} & ConnectConfig) =>
  logIn({
    mode: "email",
    email,
    verificationCode,
    ...rest,
  });

export const logInWithPasskey = async ({
  passkeyName,
  ...rest
}: {
  client: TreasureConnectClient;
  passkeyName?: string;
} & ConnectConfig) =>
  logIn({
    mode: "passkey",
    passkeyName,
    ...rest,
  });

export const logInWithSocial = async ({
  network,
  ...rest
}: {
  client: TreasureConnectClient;
  network: SocialConnectMethod;
} & ConnectConfig) => logIn({ mode: network, ...rest });

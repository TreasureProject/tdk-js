import { createThirdwebClient, defineChain } from "thirdweb";
import { signLoginPayload } from "thirdweb/auth";
import type { InAppWalletSocialAuth, Wallet } from "thirdweb/wallets";
import { inAppWallet, preAuthenticate } from "thirdweb/wallets/in-app";
import { TDKAPI } from "../api";
import { DEFAULT_TDK_API_BASE_URI, DEFAULT_TDK_CHAIN_ID } from "../constants";
import type { ConnectConfig, TreasureConnectClient } from "../types";
import { getSmartAccountConfig } from "./accounts";
import { startUserSession } from "./session";

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

export const createTreasureConnectClient = (
  clientId: string,
): TreasureConnectClient => createThirdwebClient({ clientId });

export const logInWallet = async ({
  client,
  wallet,
  apiUri = DEFAULT_TDK_API_BASE_URI,
  chainId = DEFAULT_TDK_CHAIN_ID,
  sessionOptions,
}: {
  client: TreasureConnectClient;
  wallet: Wallet;
} & ConnectConfig) => {
  const account = wallet.getAccount();
  if (!account) {
    throw new Error("Wallet account not found");
  }

  const tdk = new TDKAPI({
    baseUri: apiUri,
    chainId,
    backendWallet: sessionOptions?.backendWallet,
  });

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
  const { token, user } = await tdk.auth.logIn(signedPayload);

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

  return { user, token, tdk };
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

export const logInWithEmail = async ({
  client,
  email,
  verificationCode,
  ...connectConfig
}: {
  client: TreasureConnectClient;
  chainId: number;
  email: string;
  verificationCode: string;
} & ConnectConfig) => {
  const chainId = connectConfig.chainId ?? DEFAULT_TDK_CHAIN_ID;
  const chain = defineChain(chainId);

  const wallet = inAppWallet({
    smartAccount: getSmartAccountConfig({ chainId }),
  });

  await wallet.connect({
    client,
    chain,
    strategy: "email",
    email,
    verificationCode,
  });

  return logInWallet({
    client,
    wallet,
    ...connectConfig,
  });
};

export const logInWithSocial = async ({
  client,
  network,
  ...connectConfig
}: {
  client: TreasureConnectClient;
  network: InAppWalletSocialAuth;
} & ConnectConfig) => {
  const chainId = connectConfig.chainId ?? DEFAULT_TDK_CHAIN_ID;
  const chain = defineChain(chainId);

  const wallet = inAppWallet({
    smartAccount: getSmartAccountConfig({ chainId }),
  });

  await wallet.connect({
    client,
    chain,
    strategy: network,
  });

  return logInWallet({
    client,
    wallet,
    ...connectConfig,
  });
};

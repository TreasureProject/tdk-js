import { createThirdwebClient, defineChain } from "thirdweb";
import { signLoginPayload } from "thirdweb/auth";
import type { InAppWalletSocialAuth, Wallet } from "thirdweb/wallets";
import { inAppWallet, preAuthenticate } from "thirdweb/wallets/in-app";
import { TDKAPI } from "../api";
import { DEFAULT_TDK_API_BASE_URI, DEFAULT_TDK_CHAIN_ID } from "../constants";
import type { ConnectConfig, TreasureConnectClient } from "../types";
import { getContractAddress } from "../utils/contracts";
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

export const logIn = async (
  params: {
    client: TreasureConnectClient;
  } & (
    | {
        mode: InAppWalletSocialAuth;
      }
    | {
        mode: "email";
        email: string;
        verificationCode: string;
      }
    | {
        mode: "phone";
        phoneNumber: string;
        verificationCode: string;
      }
    | {
        mode: "passkey";
        type: "sign-up" | "sign-in";
        passkeyName?: string;
        authenticatorType?: "auto" | "local" | "extern" | "roaming" | "both";
      }
  ) &
    ConnectConfig,
) => {
  const {
    client,
    chainId = DEFAULT_TDK_CHAIN_ID,
    apiUri = DEFAULT_TDK_API_BASE_URI,
    sessionOptions,
  } = params;
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
  } else if (params.mode === "phone") {
    const { phoneNumber, verificationCode } = params;
    await wallet.connect({
      client,
      chain,
      strategy: "phone",
      phoneNumber,
      verificationCode,
    });
  } else if (params.mode === "passkey") {
    const { type, passkeyName, authenticatorType } = params;
    await wallet.connect({
      client,
      chain,
      strategy: "passkey",
      type,
      passkeyName,
      authenticatorType,
    });
  } else {
    await wallet.connect({
      client,
      chain,
      strategy: params.mode,
    });
  }

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
  type,
  passkeyName,
  authenticatorType,
  ...rest
}: {
  client: TreasureConnectClient;
  type: "sign-up" | "sign-in";
  passkeyName?: string;
  authenticatorType?: "auto" | "local" | "extern" | "roaming" | "both";
} & ConnectConfig) =>
  logIn({
    mode: "passkey",
    type,
    passkeyName,
    authenticatorType,
    ...rest,
  });

export const logInWithPhoneNumber = async ({
  phoneNumber,
  verificationCode,
  ...rest
}: {
  client: TreasureConnectClient;
  phoneNumber: string;
  verificationCode: string;
} & ConnectConfig) =>
  logIn({ mode: "phone", phoneNumber, verificationCode, ...rest });

export const logInWithSocial = async ({
  network,
  ...rest
}: {
  client: TreasureConnectClient;
  network: InAppWalletSocialAuth;
} & ConnectConfig) => logIn({ mode: network, ...rest });

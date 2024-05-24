import { TDKAPI, getContractAddress } from "@treasure-dev/tdk-react";
import { useMemo, useReducer } from "react";
import type { Chain } from "thirdweb";
import { type ThirdwebClient, getContract, sendTransaction } from "thirdweb";
import { signLoginPayload } from "thirdweb/auth";
import {
  addSessionKey,
  getAllActiveSigners,
} from "thirdweb/extensions/erc4337";
import { isContractDeployed } from "thirdweb/utils";
import type { Account, InAppWalletSocialAuth } from "thirdweb/wallets";
import { createWallet, smartWallet } from "thirdweb/wallets";
import { preAuthenticate } from "thirdweb/wallets/embedded";
import { env } from "~/utils/env";
import { getErrorMessage } from "~/utils/error";

type Status = "IDLE" | "CONFIRM_EMAIL" | "START_SESSION";

type State = {
  status: Status;
  email: string | undefined;
  error: string | undefined;
  isLoading: boolean;
};

type Action =
  | { type: "RESET" }
  | { type: "START_EMAIL_LOGIN"; email: string }
  | { type: "SHOW_CONFIRM_EMAIL" }
  | { type: "START_CONFIRMING_EMAIL" }
  | { type: "FINISH_EMAIL_LOGIN" }
  | { type: "START_SSO_LOGIN" }
  | { type: "FINISH_SSO_LOGIN" }
  | { type: "START_CUSTOM_AUTH_LOGIN"; email: string }
  | { type: "FINISH_CUSTOM_AUTH_LOGIN" }
  | { type: "ERROR"; error: string; status?: Status };

const DEFAULT_STATE: State = {
  status: "IDLE",
  email: undefined,
  error: undefined,
  isLoading: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "RESET":
      return DEFAULT_STATE;
    case "START_EMAIL_LOGIN":
      return {
        ...state,
        email: action.email,
        isLoading: true,
      };
    case "SHOW_CONFIRM_EMAIL":
      return {
        ...state,
        status: "CONFIRM_EMAIL",
        error: undefined,
        isLoading: false,
      };
    case "START_CONFIRMING_EMAIL":
      return {
        ...state,
        isLoading: true,
      };
    case "FINISH_EMAIL_LOGIN":
      return {
        ...state,
        status: "START_SESSION",
        error: undefined,
        isLoading: true,
      };
    case "START_SSO_LOGIN":
      return {
        ...state,
        isLoading: true,
      };
    case "FINISH_SSO_LOGIN":
      return {
        ...state,
        status: "START_SESSION",
        error: undefined,
        isLoading: true,
      };
    case "START_CUSTOM_AUTH_LOGIN":
      return {
        ...state,
        email: action.email,
        isLoading: true,
      };
    case "FINISH_CUSTOM_AUTH_LOGIN":
      return {
        ...state,
        status: "START_SESSION",
        error: undefined,
        isLoading: true,
      };
    case "ERROR":
      return {
        ...state,
        status: action.status ?? state.status,
        error: action.error,
        isLoading: false,
      };
  }
};

type Props = {
  project: string;
  chain: Chain;
  redirectUri: string;
  backendWallet: string;
  approvedCallTargets: string[];
};

const client: ThirdwebClient = {
  clientId: env.VITE_THIRDWEB_CLIENT_ID,
  secretKey: undefined,
};

export const useLogin = ({
  project,
  chain,
  redirectUri,
  backendWallet,
  approvedCallTargets,
}: Props) => {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  const tdk = useMemo(
    () =>
      new TDKAPI({
        baseUri: env.VITE_TDK_API_URL,
        project,
        chainId: chain.id,
      }),
    [project, chain.id],
  );

  const connectSmartWallet = async (inAppAccount: Account) => {
    const wallet = smartWallet({
      chain,
      factoryAddress: getContractAddress(chain.id, "ManagedAccountFactory"),
      gasless: true,
    });

    const smartAccount = await wallet.connect({
      client,
      personalAccount: inAppAccount,
    });

    const smartAccountContract = getContract({
      client,
      chain,
      address: smartAccount.address,
    });

    const addSessionKeyTransaction = addSessionKey({
      contract: smartAccountContract,
      account: smartAccount,
      sessionKeyAddress: backendWallet,
      permissions: {
        approvedTargets: approvedCallTargets,
        permissionStartTimestamp: new Date(Date.now() - 5 * 60 * 1000),
        permissionEndTimestamp: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const isDeployed = await isContractDeployed(smartAccountContract);
    let didCreateSession = false;

    // If smart wallet isn't deployed yet, create a new session to bundle the two txs
    if (!isDeployed) {
      try {
        console.debug("Deploying smart wallet and creating session key");
        await sendTransaction({
          account: smartAccount,
          transaction: addSessionKeyTransaction,
        });
      } catch (err) {
        console.error(
          "Error deploying smart wallet and creating session key:",
          err,
        );
        return dispatch({
          type: "ERROR",
          error: `An error occurred while deploying your Treasure account: ${getErrorMessage(
            err,
          )}`,
          status: "IDLE",
        });
      }

      didCreateSession = true;
    }

    let authToken: string;
    try {
      console.debug("Fetching login payload");
      const payload = await tdk.auth.getLoginPayload({
        address: smartAccount.address,
      });

      console.debug("Signing login payload");
      const signedPayload = await signLoginPayload({
        account: smartAccount,
        payload,
      });

      console.debug("Logging in and fetching TDK auth token");
      const loginResult = await tdk.auth.logIn(signedPayload);
      authToken = loginResult.token;
    } catch (err) {
      console.error("Error logging in smart account:", err);
      return dispatch({
        type: "ERROR",
        error: `An error occurred while authenticating your Treasure account: ${getErrorMessage(
          err,
        )}`,
        status: "IDLE",
      });
    }

    // Check active signers to see if requested session is already available
    if (!didCreateSession) {
      console.debug("Checking for existing sessions");
      const activeSigners = await getAllActiveSigners({
        contract: smartAccountContract,
      });
      const normalizedApprovedTargets = approvedCallTargets.map((callTarget) =>
        callTarget.toLowerCase(),
      );
      const hasActiveSession = activeSigners.some(
        ({ signer, approvedTargets: signerApprovedTargets }) => {
          const normalizedSignerApprovedTargets = signerApprovedTargets.map(
            (callTarget) => callTarget.toLowerCase(),
          );
          return (
            signer.toLowerCase() === backendWallet.toLowerCase() &&
            normalizedApprovedTargets.every((callTarget) =>
              normalizedSignerApprovedTargets.includes(callTarget),
            )
          );
        },
      );

      if (!hasActiveSession) {
        try {
          console.debug("Creating new session key");
          await sendTransaction({
            account: smartAccount,
            transaction: addSessionKeyTransaction,
          });
        } catch (err) {
          console.error("Error creating new session key:", err);
          return dispatch({
            type: "ERROR",
            error: `An error occurred while starting your Treasure account session: ${getErrorMessage(
              err,
            )}`,
            status: "IDLE",
          });
        }
      } else {
        console.debug("Using existing session key");
      }
    }

    // Redirect back to project
    window.location.href = `${redirectUri}?tdk_auth_token=${authToken}`;
  };

  return {
    ...state,
    reset: () => dispatch({ type: "RESET" }),
    startEmailLogin: async (email: string) => {
      dispatch({ type: "START_EMAIL_LOGIN", email });
      await preAuthenticate({
        client,
        strategy: "email",
        email,
      });
      dispatch({ type: "SHOW_CONFIRM_EMAIL" });
    },
    finishEmailLogin: async (verificationCode: string) => {
      if (!state.email) {
        console.error("Error finishing email login: No email address found");
        return dispatch({ type: "RESET" });
      }

      dispatch({ type: "START_CONFIRMING_EMAIL" });
      const wallet = createWallet("inApp");
      try {
        const account = await wallet.connect({
          client,
          strategy: "email",
          email: state.email,
          verificationCode,
        });
        connectSmartWallet(account);
        dispatch({ type: "FINISH_EMAIL_LOGIN" });
      } catch (err) {
        console.error("Error finishing email login:", err);
        dispatch({
          type: "ERROR",
          error: `An error occurred while confirming your email: ${getErrorMessage(
            err,
          )}`,
        });
      }
    },
    logInWithSocial: async (strategy: InAppWalletSocialAuth) => {
      dispatch({ type: "START_SSO_LOGIN" });
      const wallet = createWallet("inApp");
      try {
        const account = await wallet.connect({
          client,
          strategy,
        });
        connectSmartWallet(account);
        dispatch({
          type: "FINISH_SSO_LOGIN",
        });
      } catch (err) {
        console.error(`Error logging in with ${strategy}:`, err);

        const errorMessage = getErrorMessage(err);
        if (errorMessage === "User closed login window") {
          // User cancelled login
          dispatch({ type: "RESET" });
          return;
        }

        dispatch({
          type: "ERROR",
          error: `An error occurred while logging in: ${errorMessage}`,
        });
      }
    },
    // logInWithCustomAuth: async (email: string, password: string) => {
    //   dispatch({ type: "START_CUSTOM_AUTH_LOGIN", email });
    //   console.debug("Authenticating custom auth credentials");
    //   const result = await tdk.auth.authenticate({ email, password });
    //   await connectSmartWallet({
    //     connectPersonalWallet: async (embeddedWallet) => {
    //       console.debug("Verifying custom auth credentials");
    //       const authResult = await embeddedWallet.authenticate({
    //         strategy: "auth_endpoint",
    //         payload: JSON.stringify(result),
    //         encryptionKey: password,
    //       });
    //       console.debug("Connecting Embedded wallet");
    //       await embeddedWallet.connect({ authResult });
    //       didConnect.current = true;
    //       dispatch({ type: "FINISH_CUSTOM_AUTH_LOGIN" });
    //     },
    //   });
    // },
  };
};

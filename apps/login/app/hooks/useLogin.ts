import {
  embeddedWallet,
  useLogin as useAuth,
  useSmartWallet,
  useWallet,
} from "@thirdweb-dev/react";
import type { EmbeddedWalletOauthStrategy } from "@thirdweb-dev/wallets";
import { TDKAPI } from "@treasure-dev/tdk-core";
import { getContractAddress } from "@treasure-dev/tdk-react";
import { useEffect, useMemo, useReducer, useRef } from "react";
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
  | { type: "FINISH_SSO_LOGIN"; email?: string }
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
        email: action.email,
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
  chainId: number;
  redirectUri: string;
  backendWallet: string;
  approvedCallTargets: string[];
};

export const useLogin = ({
  project,
  chainId,
  redirectUri,
  backendWallet,
  approvedCallTargets,
}: Props) => {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  const { connect: connectSmartWallet } = useSmartWallet(embeddedWallet(), {
    factoryAddress: getContractAddress(chainId, "ManagedAccountFactory"),
    gasless: true,
  });
  const didConnect = useRef(false);
  const smartWallet = useWallet("smartWallet");
  const { login: authenticateSmartWallet } = useAuth();

  const tdk = useMemo(
    () =>
      new TDKAPI({
        baseUri: env.VITE_TDK_API_URL,
        project,
        chainId,
      }),
    [project, chainId],
  );

  useEffect(() => {
    if (smartWallet?.connector && didConnect.current) {
      // Immediately toggle ref because `authenticateSmartWallet` is not memoized
      didConnect.current = false;

      console.debug("Embedded wallet connected");

      const createSessionKey = () =>
        smartWallet.createSessionKey(backendWallet, {
          approvedCallTargets,
          startDate: 0,
          expirationDate: Date.now() + 86_400 * 1000,
        });

      // Start smart wallet session
      (async () => {
        let didCreateSession = false;

        // If smart wallet isn't deployed yet, create a new session to bundle the two txs
        if (!(await smartWallet.isDeployed())) {
          try {
            console.debug("Deploying smart wallet and creating session key");
            await createSessionKey();
          } catch (err) {
            console.error(
              "Error deploying smart wallet and creating session key:",
              err,
            );
            dispatch({
              type: "ERROR",
              error: `An error occurred while deploying your Treasure account: ${getErrorMessage(err)}`,
              status: "IDLE",
            });
            return;
          }

          didCreateSession = true;
        }

        let authToken: string;
        try {
          console.debug("Fetching auth token for smart account");
          authToken = await authenticateSmartWallet();
        } catch (err) {
          console.error("Error logging in smart account:", err);
          dispatch({
            type: "ERROR",
            error: `An error occurred while authenticating your Treasure account: ${getErrorMessage(err)}`,
            status: "IDLE",
          });
          return;
        }

        // Check active signers to see if requested session is already available
        if (!didCreateSession) {
          console.debug("Checking for existing sessions");
          const activeSigners = await smartWallet.getAllActiveSigners();
          const requestedCallTargets = approvedCallTargets.map((callTarget) =>
            callTarget.toLowerCase(),
          );
          const hasActiveSession = activeSigners.some(
            ({ signer, permissions }) => {
              const signerCallTargets = permissions.approvedCallTargets.map(
                (callTarget) => callTarget.toLowerCase(),
              );
              return (
                signer.toLowerCase() === backendWallet.toLowerCase() &&
                requestedCallTargets.every((callTarget) =>
                  signerCallTargets.includes(callTarget),
                )
              );
            },
          );

          if (!hasActiveSession) {
            try {
              console.debug("Creating new session key");
              await createSessionKey();
            } catch (err) {
              console.error("Error creating new session key:", err);
              dispatch({
                type: "ERROR",
                error: `An error occurred while starting your Treasure account session: ${getErrorMessage(err)}`,
                status: "IDLE",
              });
              return;
            }
          } else {
            console.debug("Using existing session key");
          }
        }

        // Redirect back to project
        window.location.href = `${redirectUri}?tdk_auth_token=${authToken}`;
      })();
    }
  }, [
    redirectUri,
    backendWallet,
    approvedCallTargets,
    smartWallet,
    authenticateSmartWallet,
  ]);

  return {
    ...state,
    reset: () => dispatch({ type: "RESET" }),
    startEmailLogin: async (email: string) => {
      dispatch({ type: "START_EMAIL_LOGIN", email });
      await connectSmartWallet({
        connectPersonalWallet: async (embeddedWallet) => {
          await embeddedWallet.sendVerificationEmail({ email });
          dispatch({ type: "SHOW_CONFIRM_EMAIL" });
        },
      });
    },
    finishEmailLogin: async (verificationCode: string) => {
      try {
        dispatch({ type: "START_CONFIRMING_EMAIL" });
        await connectSmartWallet({
          connectPersonalWallet: async (embeddedWallet) => {
            const authResult = await embeddedWallet.authenticate({
              strategy: "email_verification",
              email: state.email!,
              verificationCode,
            });
            await embeddedWallet.connect({ authResult });
            didConnect.current = true;
            dispatch({ type: "FINISH_EMAIL_LOGIN" });
          },
        });
      } catch (err) {
        console.error("Error finishing email login:", err);
        dispatch({
          type: "ERROR",
          error: `An error occurred while confirming your email: ${getErrorMessage(err)}`,
        });
      }
    },
    logInWithSSO: async (strategy: EmbeddedWalletOauthStrategy) => {
      try {
        await connectSmartWallet({
          connectPersonalWallet: async (embeddedWallet) => {
            dispatch({ type: "START_SSO_LOGIN" });
            const authResult = await embeddedWallet.authenticate({
              strategy,
            });
            await embeddedWallet.connect({ authResult });
            didConnect.current = true;

            const email = authResult.user?.authDetails.email;
            if (email) {
              dispatch({
                type: "FINISH_SSO_LOGIN",
                email,
              });
            } else {
              dispatch({
                type: "ERROR",
                error:
                  "An error occurred while logging in: No email address found",
                status: "IDLE",
              });
            }
          },
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
    logInWithCustomAuth: async (email: string, password: string) => {
      dispatch({ type: "START_CUSTOM_AUTH_LOGIN", email });
      console.debug("Authenticating custom auth credentials");
      const result = await tdk.auth.authenticate({ email, password });
      await connectSmartWallet({
        connectPersonalWallet: async (embeddedWallet) => {
          console.debug("Verifying custom auth credentials");
          const authResult = await embeddedWallet.authenticate({
            strategy: "auth_endpoint",
            payload: JSON.stringify(result),
            encryptionKey: password,
          });
          console.debug("Connecting Embedded wallet");
          await embeddedWallet.connect({ authResult });
          didConnect.current = true;
          dispatch({ type: "FINISH_CUSTOM_AUTH_LOGIN" });
        },
      });
    },
  };
};

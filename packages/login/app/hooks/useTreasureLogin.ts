import {
  embeddedWallet,
  useConnectionStatus,
  useCreateSessionKey,
  useLogin,
  useSmartWallet,
} from "@thirdweb-dev/react";
import type { EmbeddedWalletOauthStrategy } from "@thirdweb-dev/wallets";
import { getContractAddress } from "@treasure/tdk-react";
import { useCallback, useEffect, useReducer, useRef } from "react";

type State = {
  status: "IDLE" | "LOADING" | "SENDING_EMAIL" | "CONFIRM_EMAIL" | "ERROR";
  email?: string;
  error?: string;
};

type Action =
  | { type: "RESET" }
  | { type: "START_EMAIL_LOGIN"; email: string }
  | { type: "SHOW_EMAIL_CONFIRMATION" }
  | { type: "FINISH_EMAIL_LOGIN" }
  | { type: "START_SSO_LOGIN" }
  | { type: "FINISH_SSO_LOGIN"; email?: string }
  | { type: "ERROR"; error: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "RESET":
      return {
        status: "IDLE",
        email: undefined,
        error: undefined,
      };
    case "START_EMAIL_LOGIN":
      return {
        ...state,
        status: "SENDING_EMAIL",
        email: action.email,
      };
    case "SHOW_EMAIL_CONFIRMATION":
      return {
        ...state,
        status: "CONFIRM_EMAIL",
      };
    case "FINISH_EMAIL_LOGIN":
      return {
        ...state,
        status: "LOADING",
      };
    case "START_SSO_LOGIN":
      return {
        ...state,
        status: "LOADING",
      };
    case "FINISH_SSO_LOGIN":
      return {
        ...state,
        status: "LOADING",
        email: action.email,
      };
    case "ERROR":
      return {
        ...state,
        status: "ERROR",
        error: action.error,
      };
  }
};

type Props = {
  chainId: number;
  redirectUri: string;
  backendWallet: string;
  approvedCallTargets: string[];
};

const DEFAULT_ERROR_MESSAGE =
  "Sorry, we were unable to log you in. Please contact support.";

export const useTreasureLogin = ({
  chainId,
  redirectUri,
  backendWallet,
  approvedCallTargets,
}: Props) => {
  const [state, dispatch] = useReducer(reducer, {
    status: "IDLE",
  });

  const { connect: connectSmartWallet } = useSmartWallet(embeddedWallet(), {
    factoryAddress: getContractAddress(chainId, "TreasureLoginAccountFactory"),
    gasless: true,
  });
  const didConnectEmbeddedWallet = useRef(false);
  const connectionStatus = useConnectionStatus();
  const { login: logInWallet } = useLogin();
  const { mutateAsync: createSessionKey } = useCreateSessionKey();

  const handleLogin = useCallback(
    async (authToken: string) => {
      // Start on-chain session
      await createSessionKey({
        keyAddress: backendWallet,
        permissions: {
          approvedCallTargets,
          startDate: 0,
          expirationDate: Date.now() + 1000 * 60 * 60 * 24 * 3, // in 3 days
        },
      });

      // Redirect back to project
      window.location.href = `${redirectUri}?tdk_auth_token=${authToken}`;
    },
    [createSessionKey, redirectUri, backendWallet, approvedCallTargets],
  );

  useEffect(() => {
    // Only process if connecting embedded wallet. ConnectWallet component handles auth on its own
    if (connectionStatus === "connected" && didConnectEmbeddedWallet.current) {
      // Immediately toggle ref because `logInWallet` is not memoized
      didConnectEmbeddedWallet.current = false;

      // Fetch auth token for smart account
      (async () => {
        try {
          const authToken = await logInWallet();
          handleLogin(authToken);
        } catch (err) {
          console.error("Error logging in smart account:", err);
          dispatch({ type: "ERROR", error: DEFAULT_ERROR_MESSAGE });
        }
      })();
    }
  }, [connectionStatus, logInWallet, handleLogin]);

  return {
    ...state,
    reset: () => dispatch({ type: "RESET" }),
    startEmailLogin: async (email: string) => {
      dispatch({ type: "START_EMAIL_LOGIN", email });
      await connectSmartWallet({
        connectPersonalWallet: async (embeddedWallet) => {
          await embeddedWallet.sendVerificationEmail({ email });
          dispatch({ type: "SHOW_EMAIL_CONFIRMATION" });
        },
      });
    },
    finishEmailLogin: async (verificationCode: string) => {
      try {
        await connectSmartWallet({
          connectPersonalWallet: async (embeddedWallet) => {
            const authResult = await embeddedWallet.authenticate({
              strategy: "email_verification",
              email: state.email!,
              verificationCode,
            });
            await embeddedWallet.connect({ authResult });
            didConnectEmbeddedWallet.current = true;
            dispatch({ type: "FINISH_EMAIL_LOGIN" });
          },
        });
      } catch (err) {
        console.error("Error finishing email login:", err);
        dispatch({ type: "ERROR", error: DEFAULT_ERROR_MESSAGE });
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
            didConnectEmbeddedWallet.current = true;
            dispatch({
              type: "FINISH_SSO_LOGIN",
              email: authResult.user?.authDetails.email,
            });
          },
        });
      } catch (err) {
        console.error(`Error logging in with ${strategy}:`, err);
        dispatch({ type: "ERROR", error: DEFAULT_ERROR_MESSAGE });
      }
    },
    handleLogin,
  };
};

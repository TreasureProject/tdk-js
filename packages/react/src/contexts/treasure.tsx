import {
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_CHAIN_ID,
  TDKAPI,
  type User,
  createSession,
  decodeAuthToken,
  validateSession,
} from "@treasure-dev/tdk-core";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type ThirdwebClient, createThirdwebClient } from "thirdweb";
import { ThirdwebProvider, useActiveWallet } from "thirdweb/react";
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "../utils/store";

type SessionConfig = {
  chainId: number;
  approvedTargets: string[];
  nativeTokenLimitPerTransaction?: number;
};

type StartUserSessionFn = (sessionConfig: SessionConfig) => void;

type Config = {
  apiUri?: string;
  chainId?: number;
  clientId: string;
  backendWallet?: string;
  onAuthenticated?: (user: User, startUserSession: StartUserSessionFn) => void;
};

type ContextValues = {
  chainId: number;
  tdk: TDKAPI;
  thirdwebClient: ThirdwebClient;
  user?: User;
  authenticate: (authToken: string, user?: User) => Promise<void>;
  startUserSession: StartUserSessionFn;
  logOut: () => void;
};

const Context = createContext({} as ContextValues);

export const useTreasure = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error(
      "Must call `useTreasure` within a `TreasureProvider` component.",
    );
  }

  return context;
};

type Props = PropsWithChildren<Config>;

const TreasureProviderInner = ({
  children,
  apiUri = DEFAULT_TDK_API_BASE_URI,
  chainId = DEFAULT_TDK_CHAIN_ID,
  clientId,
  backendWallet,
  onAuthenticated,
}: Props) => {
  const [user, setUser] = useState<User | undefined>();
  const tdk = useMemo(
    () => new TDKAPI({ baseUri: apiUri, chainId, backendWallet }),
    [apiUri, chainId, backendWallet],
  );
  const thirdwebClient = useMemo(
    () => createThirdwebClient({ clientId }),
    [clientId],
  );
  const wallet = useActiveWallet();

  const logOut = () => {
    // Clear the TDK client's auth token
    tdk.clearAuthToken();

    // Clear the stored auth token and user
    clearStoredAuthToken();
    setUser(undefined);

    // Disconnect any active wallet
    wallet?.disconnect();
  };

  const validateUserSession = async ({
    chainId,
    approvedTargets,
    nativeTokenLimitPerTransaction,
  }: SessionConfig) => {
    // Backend wallet is required to have a valid session
    if (!backendWallet) {
      return false;
    }

    const sessions =
      user && user.allActiveSigners.length > 0
        ? user.allActiveSigners
        : await tdk.user.getSessions({ chainId });
    return validateSession({
      backendWallet,
      approvedTargets,
      nativeTokenLimitPerTransaction,
      sessions,
    });
  };

  const createUserSession = async ({
    chainId,
    approvedTargets,
    nativeTokenLimitPerTransaction,
  }: SessionConfig) => {
    const account = await wallet?.getAccount();

    if (!account) {
      throw new Error(
        "Unable to create user session: connected account not found",
      );
    }

    if (!backendWallet) {
      throw new Error(
        "Unable to create user session: backend wallet not provided",
      );
    }

    return createSession({
      client: thirdwebClient,
      chainId,
      address: account.address,
      account,
      backendWallet,
      approvedTargets,
      nativeTokenLimitPerTransaction,
    });
  };

  const startUserSession = async (sessionConfig: SessionConfig) => {
    const isSessionRequired = sessionConfig.approvedTargets.length > 0;

    // Skip session creation if not required by app
    if (!isSessionRequired) {
      console.debug("[TreasureProvider] Session not required by app");
      return;
    }

    // Skip session creation if user has an active session already
    const hasActiveSession = await validateUserSession(sessionConfig);
    if (hasActiveSession) {
      console.debug("[TreasureProvider] Using existing session");
      return;
    }

    // Create new session, if needed
    console.debug("[TreasureProvider] Creating new session");
    try {
      const session = await createUserSession(sessionConfig);
      // Optimistically update the user sessions
      setUser((user) =>
        user
          ? {
              ...user,
              allActiveSigners: [...user.allActiveSigners, session],
            }
          : undefined,
      );
    } catch (err) {
      console.error("[TreasureProvider] Error creating user session:", err);
      logOut();
    }
  };

  const authenticate = async (authToken: string, user?: User) => {
    // Set the TDK client's auth token
    tdk.setAuthToken(authToken);

    // Fetch user if one wasn't provided
    let nextUser = user;
    if (!nextUser) {
      try {
        nextUser = await tdk.user.me();
      } catch (err) {
        console.error(
          "[TreasureProvider] Error fetching current user details:",
          err,
        );
        return logOut();
      }
    }

    // Update user state
    setUser(nextUser);

    // Store the auth token
    setStoredAuthToken(authToken);

    // Trigger callback
    await onAuthenticated?.(nextUser, startUserSession);
  };

  // Check local storage for stored auth token
  // biome-ignore lint/correctness/useExhaustiveDependencies: purposely only run once on mount
  useEffect(() => {
    const authToken = getStoredAuthToken();
    if (authToken) {
      // Decode the auth token and immediately set user if not expired
      const decodedAuthToken = decodeAuthToken(authToken);
      if (decodedAuthToken.exp > Date.now() / 1000) {
        setUser({
          id: decodedAuthToken.ctx.id,
          email: decodedAuthToken.ctx.email,
          smartAccountAddress: decodedAuthToken.sub,
          allActiveSigners: [],
        });
      }

      authenticate(authToken);
    }
  }, []);

  return (
    <Context.Provider
      value={{
        chainId,
        tdk,
        thirdwebClient,
        user,
        authenticate,
        logOut,
        startUserSession,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const TreasureProvider = (props: Props) => (
  <ThirdwebProvider>
    <TreasureProviderInner {...props} />
  </ThirdwebProvider>
);
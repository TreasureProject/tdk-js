import {
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_CHAIN_ID,
  TDKAPI,
  type User,
  createSession,
  validateSession,
} from "@treasure-dev/tdk-core";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type ThirdwebClient, createThirdwebClient } from "thirdweb";
import {
  ThirdwebProvider,
  useActiveAccount,
  useActiveWallet,
} from "thirdweb/react";
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "./utils/store";

type AppConfig = {
  name: string;
  icon: string;
};

type ConnectConfig = {
  backendWallet: string;
  approvedTargets: string[];
  nativeTokenLimitPerTransaction?: number;
};

type Config = {
  clientId: string;
  apiUri?: string;
  chainId?: number;
  app: AppConfig;
  connect?: ConnectConfig;
};

type ContextValues = {
  chainId: number;
  app: AppConfig;
  tdk: TDKAPI;
  thirdwebClient: ThirdwebClient;
  user?: User;
  authenticate: (authToken: string, user?: User) => Promise<void>;
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

const InnerTreasureProvider = ({
  children,
  clientId,
  apiUri = DEFAULT_TDK_API_BASE_URI,
  chainId = DEFAULT_TDK_CHAIN_ID,
  app,
  connect: connectConfig,
}: Props) => {
  const [user, setUser] = useState<User | undefined>();

  const tdk = useMemo(
    () => new TDKAPI({ baseUri: apiUri, chainId }),
    [apiUri, chainId],
  );
  const thirdwebClient = useMemo(
    () => createThirdwebClient({ clientId }),
    [clientId],
  );
  const account = useActiveAccount();
  const wallet = useActiveWallet();

  const backendWallet = connectConfig?.backendWallet.toLowerCase();
  const approvedTargets = (connectConfig?.approvedTargets ?? []).map(
    (address) => address.toLowerCase(),
  );
  const nativeTokenLimitPerTransaction =
    connectConfig?.nativeTokenLimitPerTransaction ?? 0;
  const isSessionRequired =
    approvedTargets.length > 0 || nativeTokenLimitPerTransaction > 0;

  const validateUserSession = async () => {
    const sessions = await tdk.user.getSessions({ chainId });
    return validateSession({
      backendWallet,
      approvedTargets,
      nativeTokenLimitPerTransaction,
      sessions,
    });
  };

  const createUserSession = async () => {
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

    createSession({
      client: thirdwebClient,
      chainId,
      address: account.address,
      account,
      backendWallet,
      approvedTargets,
      nativeTokenLimitPerTransaction,
    });
  };

  const logOut = () => {
    // Clear the TDK client's auth token
    tdk.clearAuthToken();

    // Clear the stored auth token and user
    clearStoredAuthToken();
    setUser(undefined);

    // Disconnect any active wallet
    wallet?.disconnect();
  };

  const authenticate = async (authToken: string, user?: User) => {
    // Update the TDK client's auth token
    tdk.setAuthToken(authToken);

    // Fetch user if one wasn't provided
    if (user) {
      setUser(user);
    } else {
      try {
        const nextUser = await tdk.user.me();
        setUser(nextUser);
      } catch (err) {
        console.error(
          "[TreasureProvider] Error fetching current user details:",
          err,
        );
        return logOut();
      }
    }

    // Store the auth token
    setStoredAuthToken(authToken);

    // Skip session creation if not required by app
    if (!isSessionRequired) {
      console.debug("[TreasureProvider] Session not required by app");
      return;
    }

    // Skip session creation if user has an active session already
    const hasActiveSession = await validateUserSession();
    if (hasActiveSession) {
      console.debug("[TreasureProvider] Using existing session");
      return;
    }

    // Create new session, if needed
    console.debug("[TreasureProvider] Creating new session");
    await createUserSession();
  };

  // Check local storage for stored auth token
  // biome-ignore lint/correctness/useExhaustiveDependencies: purposely only run once on mount
  useEffect(() => {
    const authToken = getStoredAuthToken();
    if (authToken) {
      authenticate(authToken);
    }
  }, []);

  return (
    <Context.Provider
      value={{
        chainId,
        app,
        tdk,
        thirdwebClient,
        user,
        authenticate,
        logOut,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const TreasureProvider = (props: Props) => (
  <ThirdwebProvider>
    <InnerTreasureProvider {...props} />
  </ThirdwebProvider>
);

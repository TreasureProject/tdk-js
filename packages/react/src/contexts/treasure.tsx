import {
  type AddressString,
  type Contract,
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_CHAIN_ID,
  TDKAPI,
  type User,
  createSession,
  decodeAuthToken,
  getContractAddresses,
  validateSession,
} from "@treasure-dev/tdk-core";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  type Chain,
  type ThirdwebClient,
  createThirdwebClient,
  defineChain,
} from "thirdweb";
import { signLoginPayload } from "thirdweb/auth";
import {
  ThirdwebProvider,
  useActiveWallet,
  useActiveWalletConnectionStatus,
  useAutoConnect,
  useIsAutoConnecting,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import type { Account } from "thirdweb/wallets";
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "../utils/store";
import { SUPPORTED_WALLETS } from "../utils/wallet";

type SessionOptions = {
  chainId: number;
  backendWallet: string;
  approvedTargets: string[];
  nativeTokenLimitPerTransaction?: bigint;
};

type Config = {
  apiUri?: string;
  chainId?: number;
  clientId: string;
  sessionOptions?: Omit<SessionOptions, "chainId">;
  onConnect?: (user: User) => void;
};

type ContextValues = {
  chain: Chain;
  contractAddresses: Record<Contract, AddressString>;
  tdk: TDKAPI;
  thirdwebClient: ThirdwebClient;
  user?: User;
  isConnecting: boolean;
  logIn: (account: Account) => void;
  logOut: () => void;
  startUserSession: (
    options: SessionOptions,
    overrideAccount?: Account,
  ) => void;
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
  sessionOptions,
  onConnect,
}: Props) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState<User | undefined>();
  const tdk = useMemo(
    () =>
      new TDKAPI({
        baseUri: apiUri,
        chainId,
        backendWallet: sessionOptions?.backendWallet,
      }),
    [apiUri, chainId, sessionOptions?.backendWallet],
  );
  const thirdwebClient = useMemo(
    () => createThirdwebClient({ clientId }),
    [clientId],
  );
  const wallet = useActiveWallet();
  const walletStatus = useActiveWalletConnectionStatus();
  const switchWalletChain = useSwitchActiveWalletChain();
  const isAutoConnecting = useIsAutoConnecting();
  const chain = useMemo(() => defineChain(chainId), [chainId]);
  const contractAddresses = useMemo(
    () => getContractAddresses(chainId),
    [chainId],
  );

  const logOut = () => {
    setUser(undefined);
    tdk.clearAuthToken();
    clearStoredAuthToken();
    wallet?.disconnect();
  };

  const validateUserSession = async ({
    chainId,
    backendWallet,
    approvedTargets,
    nativeTokenLimitPerTransaction,
  }: SessionOptions) => {
    const sessions = await tdk.user.getSessions({ chainId });
    return validateSession({
      backendWallet,
      approvedTargets,
      nativeTokenLimitPerTransaction,
      sessions,
    });
  };

  const createUserSession = async (
    {
      chainId,
      backendWallet,
      approvedTargets,
      nativeTokenLimitPerTransaction,
    }: SessionOptions,
    overrideAccount?: Account,
  ) => {
    const account = overrideAccount ?? (await wallet?.getAccount());
    if (!account) {
      throw new Error("Active wallet account not found");
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

  const startUserSession = async (
    options: SessionOptions,
    overrideAccount?: Account,
  ) => {
    // Skip session creation if not required by app
    if (options.approvedTargets.length === 0) {
      console.debug("[TreasureProvider] Session not required by app");
      return;
    }

    // Skip session creation if user has an active session already
    const hasActiveSession = await validateUserSession(options);
    if (hasActiveSession) {
      console.debug("[TreasureProvider] Using existing session");
      return;
    }

    // Create new session, if needed
    console.debug("[TreasureProvider] Creating new session");
    try {
      const session = await createUserSession(options, overrideAccount);
      // Optimistically update the user sessions
      setUser((user) =>
        user
          ? { ...user, allActiveSigners: [...user.allActiveSigners, session] }
          : undefined,
      );
    } catch (err) {
      console.error("[TreasureProvider] Error creating user session:", err);
      throw err;
    }
  };

  const logIn = async (account: Account) => {
    let nextUser: User | undefined;

    // Check for existing stored auth token
    let nextAuthToken = getStoredAuthToken();
    if (nextAuthToken) {
      // Validate if it's expired before attempting to use it
      try {
        const { exp: authTokenExpirationDate } = decodeAuthToken(nextAuthToken);
        if (authTokenExpirationDate > Date.now() / 1000) {
          nextUser = await tdk.user.me({ overrideAuthToken: nextAuthToken });
        }
      } catch (err) {
        console.debug(
          "[TreasureProvider] Error fetching user with stored auth token:",
          err,
        );
        // Ignore errors and proceed with login
      }
    }

    if (!nextUser) {
      // Generate login payload for user
      console.debug("[TreasureProvider] Generating login payload");
      const payload = await tdk.auth.getLoginPayload({
        address: account.address,
      });

      // Sign generated payload
      console.debug("[TreasureProvider] Signing login payload");
      const signedPayload = await signLoginPayload({
        payload,
        account,
      });

      // Log in with signed payload
      console.debug("[TreasureProvider] Logging in with signed payload");
      const { token, user } = await tdk.auth.logIn(signedPayload);
      nextAuthToken = token;
      nextUser = user;
    }

    // Set auth token on TDK so it's used in future requests
    tdk.setAuthToken(nextAuthToken as string);

    // Start user session if configured
    if (sessionOptions) {
      await startUserSession(
        {
          ...sessionOptions,
          chainId,
        },
        account,
      );
    }

    // Update user state
    setUser(nextUser);
    setStoredAuthToken(nextAuthToken as string);

    // Trigger completion callback
    onConnect?.(nextUser);
  };

  // Switch the Thirdweb SDK's chain if the provider's chain changes
  useEffect(() => {
    console.debug("[TreasureProvider] Switching chain:", chain.id);
    switchWalletChain(chain);
  }, [switchWalletChain, chain]);

  // Attempt an automatic background connection
  useAutoConnect({
    client: thirdwebClient,
    wallets: SUPPORTED_WALLETS,
    accountAbstraction: {
      chain,
      factoryAddress: contractAddresses.ManagedAccountFactory,
      sponsorGas: true,
    },
    timeout: 5_000,
    onConnect: async (wallet) => {
      const account = wallet.getAccount();
      if (account) {
        setIsAuthenticating(true);
        try {
          await logIn(account);
        } catch (err) {
          console.debug(
            "[TreasureProvider] Error logging in with auto-connect:",
            err,
          );
          setIsAuthenticating(false);
        }
      }
    },
  });

  return (
    <Context.Provider
      value={{
        chain,
        contractAddresses,
        tdk,
        thirdwebClient,
        user,
        isConnecting:
          isAutoConnecting || walletStatus === "connecting" || isAuthenticating,
        logIn: async (account: Account) => {
          setIsAuthenticating(true);
          try {
            await logIn(account);
          } catch (err) {
            setIsAuthenticating(false);
            throw err;
          }
        },
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

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
import type { Wallet } from "thirdweb/wallets";
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "../utils/store";
import { SUPPORTED_WALLETS } from "../utils/wallet";

type SessionOptions = {
  wallet?: Wallet;
  chainId?: number;
  backendWallet: string;
  approvedTargets: string[];
  nativeTokenLimitPerTransaction?: bigint;
  sessionDurationSec?: number;
  sessionMinDurationLeftSec?: number;
};

type Config = {
  apiUri?: string;
  chainId?: number;
  clientId: string;
  sessionOptions?: Omit<SessionOptions, "account" | "chainId">;
  onConnect?: (user: User) => void;
};

type ContextValues = {
  chain: Chain;
  contractAddresses: Record<Contract, AddressString>;
  tdk: TDKAPI;
  thirdwebClient: ThirdwebClient;
  user?: User;
  isConnecting: boolean;
  logIn: (wallet: Wallet) => void;
  logOut: () => void;
  startUserSession: (options: SessionOptions) => void;
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
  const activeWallet = useActiveWallet();
  const activeWalletStatus = useActiveWalletConnectionStatus();
  const switchActiveWalletChain = useSwitchActiveWalletChain();
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
    activeWallet?.disconnect();
  };

  const startUserSession = async (options: SessionOptions) => {
    // Skip session creation if not required by app
    if (options.approvedTargets.length === 0) {
      console.debug("[TreasureProvider] Session not required by app");
      return;
    }

    const wallet = options.wallet ?? activeWallet;
    const walletChainId = wallet?.getChain()?.id;
    const chainId = options.chainId ?? walletChainId ?? chain.id;

    // Skip session creation if user has an active session already
    const sessions = await tdk.user.getSessions({ chainId });
    const hasActiveSession = await validateSession({
      ...options,
      sessions,
    });
    if (hasActiveSession) {
      console.debug("[TreasureProvider] Using existing session");
      return;
    }

    // Session needs to be created, so a valid wallet is required
    if (!wallet) {
      throw new Error("Wallet required for session creation");
    }

    // Switch chains if requested session chain is different
    if (chainId !== walletChainId) {
      console.debug(
        "[TreasureProvider] Switching chains for session creation:",
        chainId,
      );
      await wallet.switchChain(defineChain(chainId));
    }

    const account = wallet.getAccount();
    if (!account) {
      throw new Error("Wallet account required for session creation");
    }

    console.debug("[TreasureProvider] Creating new session");
    try {
      await createSession({
        ...options,
        client: thirdwebClient,
        chainId,
        account,
      });
    } catch (err) {
      console.error("[TreasureProvider] Error creating user session:", err);
      throw err;
    }
  };

  const logIn = async (wallet: Wallet) => {
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
      const account = wallet.getAccount();
      if (!account) {
        throw new Error("Wallet account not found");
      }

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
      await startUserSession({
        ...sessionOptions,
        wallet,
        chainId,
      });
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
    switchActiveWalletChain(chain);
  }, [switchActiveWalletChain, chain]);

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
      setIsAuthenticating(true);
      try {
        await logIn(wallet);
      } catch (err) {
        console.debug(
          "[TreasureProvider] Error logging in with auto-connect:",
          err,
        );
        setIsAuthenticating(false);
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
          isAutoConnecting ||
          activeWalletStatus === "connecting" ||
          isAuthenticating,
        logIn: async (wallet: Wallet) => {
          setIsAuthenticating(true);
          try {
            await logIn(wallet);
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

import {
  type AddressString,
  type Contract,
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_CHAIN_ID,
  SUPPORTED_IN_APP_WALLET_OPTIONS,
  SUPPORTED_WEB3_WALLETS,
  type SessionOptions,
  TDKAPI,
  type TreasureConnectClient,
  type User,
  authenticateWallet,
  createTreasureConnectClient,
  decodeAuthToken,
  getContractAddresses,
  startUserSession,
} from "@treasure-dev/tdk-core";
import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { I18nextProvider } from "react-i18next";
import { type Chain, defineChain } from "thirdweb";
import {
  ThirdwebProvider,
  useActiveWallet,
  useActiveWalletConnectionStatus,
  useAutoConnect,
  useIsAutoConnecting,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { type Wallet, inAppWallet } from "thirdweb/wallets";

import { type SupportedLanguage, i18n } from "../i18n";
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "../utils/store";

type Config = {
  language?: SupportedLanguage;
  appName: string;
  appIconUri?: string;
  apiUri?: string;
  chainId?: number;
  clientId: string;
  sessionOptions?: SessionOptions;
  onConnect?: (user: User) => void;
};

type ContextValues = {
  appName: string;
  appIconUri?: string;
  chain: Chain;
  contractAddresses: Record<Contract, AddressString>;
  tdk: TDKAPI;
  client: TreasureConnectClient;
  user?: User;
  isConnecting: boolean;
  logIn: (wallet: Wallet) => void;
  logOut: () => void;
  startUserSession: (options: SessionOptions) => void;
  setRootElement: (el: ReactNode) => void;
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
  appName,
  appIconUri,
  apiUri = DEFAULT_TDK_API_BASE_URI,
  chainId = DEFAULT_TDK_CHAIN_ID,
  clientId,
  sessionOptions,
  onConnect,
}: Props) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState<User | undefined>();
  const [el, setEl] = useState<ReactNode>(null);
  const tdk = useMemo(
    () =>
      new TDKAPI({
        baseUri: apiUri,
        chainId,
        backendWallet: sessionOptions?.backendWallet,
      }),
    [apiUri, chainId, sessionOptions?.backendWallet],
  );
  const client = useMemo(
    () => createTreasureConnectClient({ clientId }),
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
      const { token, user } = await authenticateWallet({ wallet, tdk });
      nextAuthToken = token;
      nextUser = user;
    }

    // Set auth token on TDK so it's used in future requests
    tdk.setAuthToken(nextAuthToken as string);

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
    client,
    wallets: [
      inAppWallet({ auth: { options: SUPPORTED_IN_APP_WALLET_OPTIONS } }),
      ...SUPPORTED_WEB3_WALLETS,
    ],
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
      }

      setIsAuthenticating(false);
    },
  });

  return (
    <Context.Provider
      value={{
        appName,
        appIconUri,
        chain,
        contractAddresses,
        tdk,
        client,
        user,
        isConnecting:
          isAutoConnecting ||
          activeWalletStatus === "connecting" ||
          isAuthenticating,
        logIn: async (wallet: Wallet) => {
          setIsAuthenticating(true);
          try {
            await logIn(wallet);
            setIsAuthenticating(false);
          } catch (err) {
            setIsAuthenticating(false);
            throw err;
          }
        },
        logOut,
        startUserSession: (options: SessionOptions) =>
          startUserSession({
            client,
            wallet: activeWallet,
            chainId,
            tdk,
            options,
          }),
        setRootElement: setEl,
      }}
    >
      {children}
      {el}
    </Context.Provider>
  );
};

export const TreasureProvider = (props: Props) => {
  useEffect(() => {
    if (props.language) {
      i18n.changeLanguage(props.language);
    }
  }, [props.language]);

  return (
    <ThirdwebProvider>
      <I18nextProvider i18n={i18n}>
        <TreasureProviderInner {...props} />
      </I18nextProvider>
    </ThirdwebProvider>
  );
};

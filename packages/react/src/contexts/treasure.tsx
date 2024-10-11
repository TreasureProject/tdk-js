import {
  AnalyticsManager,
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_CHAIN_ID,
  DEFAULT_TDK_ECOSYSTEM_ID,
  type SessionOptions,
  TDKAPI,
  type TrackableEvent,
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
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { I18nextProvider } from "react-i18next";
import { defineChain } from "thirdweb";
import {
  useActiveWallet,
  useActiveWalletChain,
  useActiveWalletConnectionStatus,
  useAutoConnect,
  useIsAutoConnecting,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { type Wallet, ecosystemWallet } from "thirdweb/wallets";

import { startUserSessionViaLauncher } from "@treasure-dev/launcher";
import { useLauncher } from "../hooks/useLauncher";
import { i18n } from "../i18n";
import type { AnalyticsEvent, Config, ContextValues } from "../types";
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "../utils/store";

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
  defaultChainId = DEFAULT_TDK_CHAIN_ID,
  clientId,
  ecosystemId = DEFAULT_TDK_ECOSYSTEM_ID,
  ecosystemPartnerId,
  sessionOptions,
  autoConnectTimeout = 5_000,
  onConnect,
  launcherOptions,
  analyticsOptions,
}: Props) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState<User | undefined>();
  const [el, setEl] = useState<ReactNode>(null);
  const client = useMemo(
    () => createTreasureConnectClient({ clientId }),
    [clientId],
  );
  const activeWallet = useActiveWallet();
  const activeWalletStatus = useActiveWalletConnectionStatus();
  const activeWalletChain = useActiveWalletChain();
  const switchActiveWalletChain = useSwitchActiveWalletChain();
  const isAutoConnecting = useIsAutoConnecting();
  const chain = activeWalletChain ?? defineChain(defaultChainId);
  const tdk = useMemo(
    () =>
      new TDKAPI({
        baseUri: apiUri,
        chainId: chain.id,
        backendWallet: sessionOptions?.backendWallet,
      }),
    [apiUri, chain.id, sessionOptions?.backendWallet],
  );
  const contractAddresses = useMemo(
    () => getContractAddresses(chain.id),
    [chain.id],
  );

  const analyticsManager = useMemo(() => {
    if (!analyticsOptions) {
      return undefined;
    }
    return new AnalyticsManager({
      apiUri: analyticsOptions.apiUri,
      apiKey: analyticsOptions.apiKey,
      app: analyticsOptions.appInfo,
    });
  }, [analyticsOptions]);

  const trackCustomEvent = useCallback(
    async (event: AnalyticsEvent) => {
      if (!analyticsManager) {
        throw new Error(
          "Cannot call trackCustomEvent because AnalyticsManager is not initialized",
        );
      }

      const smartAccountAddress =
        event.smartAccountAddress ?? user?.smartAccountAddress;

      if (smartAccountAddress === undefined && event.userId === undefined) {
        throw new Error(
          "Cannot track event without userId or smartAccountAddress",
        );
      }

      // After the previous check one must be non-null so this works
      const playerId = {
        smart_account: smartAccountAddress,
        user_id: event.userId,
      } as
        | {
            smart_account?: string;
            user_id: string;
          }
        | {
            smart_account: string;
            user_id?: string;
          };

      const trackableEvent: TrackableEvent = {
        ...playerId,
        cartridge_tag: event.cartridgeTag,
        name: event.name,
        properties: event.properties,
      };
      return analyticsManager.trackCustomEvent(trackableEvent);
    },
    [analyticsManager, user?.smartAccountAddress],
  );

  const onAuthTokenUpdated = useCallback(
    (authToken: string) => {
      tdk.user.me({ overrideAuthToken: authToken }).then((user) => {
        setUser(user);
        setStoredAuthToken(authToken);
        tdk.setAuthToken(authToken);
        onConnect?.(user);
      });
    },
    [tdk.user.me, tdk.setAuthToken, onConnect],
  );

  const { isUsingTreasureLauncher, openLauncherAccountModal } = useLauncher({
    getAuthTokenOverride: launcherOptions?.getAuthTokenOverride,
    setRootElement: setEl,
    onAuthTokenUpdated,
  });

  const logOut = () => {
    setUser(undefined);
    tdk.clearAuthToken();
    clearStoredAuthToken();
    activeWallet?.disconnect();
  };

  const logIn = async (wallet: Wallet): Promise<User | undefined> => {
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
        chainId: chain.id,
        tdk,
        sessions: nextUser.sessions,
        options: sessionOptions,
      });
    }

    // Update user state
    setUser(nextUser);
    setStoredAuthToken(nextAuthToken as string);

    // Trigger completion callback
    onConnect?.(nextUser);
    return nextUser;
  };

  // Attempt an automatic background connection
  useAutoConnect({
    client,
    wallets: [
      ecosystemWallet(ecosystemId, {
        partnerId: ecosystemPartnerId,
      }),
    ],
    accountAbstraction: {
      chain,
      factoryAddress: contractAddresses.ManagedAccountFactory,
      sponsorGas: true,
    },
    timeout: autoConnectTimeout,
    onConnect: async (wallet) => {
      if (isUsingTreasureLauncher) {
        console.debug(
          "[TreasureProvider] Skipping auto-connect because launcher is being used",
        );
        return;
      }
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
        ecosystemId,
        ecosystemPartnerId,
        user,
        isConnecting:
          isAutoConnecting ||
          activeWalletStatus === "connecting" ||
          isAuthenticating,
        logIn: async (wallet: Wallet) => {
          if (isUsingTreasureLauncher) {
            console.debug(
              "[TreasureProvider] Skipping auto-connect because launcher is being used",
            );
            return;
          }
          setIsAuthenticating(true);
          try {
            const nextUser = await logIn(wallet);
            setIsAuthenticating(false);
            return nextUser;
          } catch (err) {
            setIsAuthenticating(false);
            throw err;
          }
        },
        logOut,
        startUserSession: (options: SessionOptions) =>
          isUsingTreasureLauncher
            ? startUserSessionViaLauncher(options)
            : startUserSession({
                client,
                wallet: activeWallet,
                chainId: chain.id,
                tdk,
                options,
              }),
        switchChain: (chainId: number) =>
          switchActiveWalletChain(defineChain(chainId)),
        setRootElement: setEl,
        isUsingTreasureLauncher,
        openLauncherAccountModal,
        trackCustomEvent,
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
    <I18nextProvider i18n={i18n}>
      <TreasureProviderInner {...props} />
    </I18nextProvider>
  );
};

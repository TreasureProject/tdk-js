import { startUserSessionViaLauncher } from "@treasure-dev/launcher";
import {
  AnalyticsManager,
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_CHAIN_ID,
  DEFAULT_TDK_ECOSYSTEM_ID,
  type LegacyProfile,
  type SessionOptions,
  TDKAPI,
  type TrackableEvent,
  type User,
  authenticateWallet,
  createTreasureConnectClient,
  decodeAuthToken,
  getContractAddresses,
  getUserAddress,
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
import { ZERO_ADDRESS, defineChain } from "thirdweb";
import {
  useActiveWallet,
  useActiveWalletChain,
  useActiveWalletConnectionStatus,
  useAutoConnect,
  useIsAutoConnecting,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { type Wallet, ecosystemWallet } from "thirdweb/wallets";

import { useLauncher } from "../hooks/useLauncher";
import { i18n } from "../i18n";
import type { AnalyticsEvent, Config, ContextValues } from "../types";
import {
  EVT_TREASURECONNECT_CONNECTED,
  EVT_TREASURECONNECT_DISCONNECTED,
} from "../utils/defaultAnalytics";
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
  analyticsOptions,
  authOptions,
  launcherOptions,
  sessionOptions,
  autoConnectTimeout = 5_000,
  onConnect,
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
        client,
      }),
    [apiUri, chain.id, sessionOptions?.backendWallet, client],
  );

  const contractAddresses = useMemo(
    () => getContractAddresses(chain.id),
    [chain.id],
  );

  const userAddress = user
    ? (getUserAddress(user, chain.id) ?? user.smartAccounts[0]?.address)
    : undefined;

  useEffect(() => {
    if (!analyticsOptions || AnalyticsManager.instance.initialized) {
      return;
    }

    AnalyticsManager.instance.init({
      apiUri: analyticsOptions.apiUri,
      apiKey: analyticsOptions.apiKey,
      app: analyticsOptions.appInfo,
      cartridgeTag: analyticsOptions.cartridgeTag,
      device: analyticsOptions.device,
    });
  }, [analyticsOptions]);

  const trackCustomEvent = useCallback(
    async (event: AnalyticsEvent): Promise<string | undefined> => {
      if (!AnalyticsManager.instance.initialized) {
        return undefined;
      }

      let address = event.address ?? userAddress;

      if (address === undefined && event.userId === undefined) {
        address = "";
        event.userId = "";
      }

      // After the previous check one must be non-null so this works
      const playerId = {
        smart_account: address,
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
        name: event.name,
        properties: event.properties ?? {},
      };
      return AnalyticsManager.instance.trackCustomEvent(trackableEvent);
    },
    [userAddress],
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
    if (analyticsOptions?.automaticTrackLogout !== false) {
      trackCustomEvent({
        name: EVT_TREASURECONNECT_DISCONNECTED,
        properties: {
          isUsingTreasureLauncher,
        },
      })
        .then((eventId) => {
          console.debug(`[TreasureProvider] tracked logout event: ${eventId}`);
        })
        .catch((err) => {
          console.error(`[TreasureProvider] error tracking logout: ${err}`);
        });
    }
    setUser(undefined);
    tdk.clearAuthToken();
    tdk.clearActiveWallet();
    clearStoredAuthToken();
    activeWallet?.disconnect();
  };

  const logIn = async (
    wallet: Wallet,
    chainId?: number,
    skipCurrentUser = false,
  ): Promise<{ user: User | undefined; legacyProfiles: LegacyProfile[] }> => {
    if (isUsingTreasureLauncher) {
      console.debug(
        "[TreasureProvider] Skipping login because launcher is being used",
      );
      return { user: undefined, legacyProfiles: [] };
    }

    let user: User | undefined;
    let legacyProfiles: LegacyProfile[] = [];
    let authToken = getStoredAuthToken();

    // Check for existing stored auth token
    if (authToken && !skipCurrentUser) {
      // Validate if it's expired before attempting to use it
      try {
        const { exp: authTokenExpirationDate } = decodeAuthToken(authToken);
        if (authTokenExpirationDate > Date.now() / 1000) {
          setIsAuthenticating(true);
          user = await tdk.user.me({ overrideAuthToken: authToken });
        }
      } catch (err) {
        console.debug(
          "[TreasureProvider] Error fetching user with stored auth token:",
          err,
        );
        // Ignore errors and proceed with login
      }
    }

    if (chainId) {
      tdk.chainId = chainId;
    }

    if (!user) {
      setIsAuthenticating(true);
      try {
        const result = await authenticateWallet({
          wallet,
          tdk,
          authTokenDurationSec:
            authOptions?.authTokenDurationSec ??
            sessionOptions?.sessionDurationSec,
        });
        authToken = result.token;
        user = result.user;
        legacyProfiles = result.legacyProfiles;
      } catch (err) {
        setIsAuthenticating(false);
        throw err;
      }
    }

    // Set auth token and wallet on TDK so they can be used in future requests
    tdk.setAuthToken(authToken as string);
    tdk.setActiveWallet(wallet);

    // Start user session if configured
    if (sessionOptions) {
      setIsAuthenticating(true);
      try {
        await startUserSession({
          client,
          wallet,
          chainId: chainId ?? chain.id,
          tdk,
          sessions: user.sessions,
          options: sessionOptions,
        });
      } catch (err) {
        setIsAuthenticating(false);
        throw err;
      }
    }

    // Update user state
    setUser(user);
    setStoredAuthToken(authToken as string);

    if (analyticsOptions?.automaticTrackLogin !== false) {
      trackCustomEvent({
        name: EVT_TREASURECONNECT_CONNECTED,
        properties: {
          isUsingTreasureLauncher,
        },
      })
        .then((eventId) => {
          console.debug(`[TreasureProvider] tracked login event: ${eventId}`);
        })
        .catch((err) => {
          console.error(`[TreasureProvider] error tracking login: ${err}`);
        });
    }

    // Trigger completion callback
    onConnect?.(user);

    setIsAuthenticating(false);
    return { user, legacyProfiles };
  };

  const switchChain = async (chainId: number) => {
    if (activeWallet) {
      await switchActiveWalletChain(defineChain(chainId));
      await logIn(activeWallet, chainId, true);
    }
  };

  // Attempt an automatic background connection
  useAutoConnect({
    client,
    wallets: [
      ecosystemWallet(ecosystemId, {
        partnerId: ecosystemPartnerId,
      }),
    ],
    timeout: autoConnectTimeout,
    onConnect: logIn,
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
        isConnecting:
          isAutoConnecting ||
          activeWalletStatus === "connecting" ||
          isAuthenticating,
        ...(user
          ? {
              isConnected: true,
              user,
              userAddress: userAddress ?? ZERO_ADDRESS, // should not reach here
            }
          : {
              isConnected: false,
              user: undefined,
              userAddress: undefined,
            }),
        isUsingTreasureLauncher,
        logIn,
        logOut,
        updateUser: (partialUser) =>
          setUser((curr) => (curr ? { ...curr, ...partialUser } : undefined)),
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
        switchChain,
        setRootElement: setEl,
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

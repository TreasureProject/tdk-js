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
import { ZERO_ADDRESS, defineChain } from "thirdweb";
import {
  useActiveWallet,
  useActiveWalletChain,
  useActiveWalletConnectionStatus,
  useAutoConnect,
  useIsAutoConnecting,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { isZkSyncChain } from "thirdweb/utils";
import { type Wallet, ecosystemWallet } from "thirdweb/wallets";

import type { AnalyticsEvent, Config, ContextValues } from "../types";
import { useLauncher } from "../ui/hooks/useLauncher";
import {
  EVT_TREASURECONNECT_CONNECTED,
  EVT_TREASURECONNECT_DISCONNECTED,
} from "../utils/defaultAnalytics";
import {
  clearStoredAuthMethod,
  clearStoredAuthToken,
  getStoredAuthMethod,
  getStoredAuthToken,
  setStoredAuthMethod,
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

export const TreasureProvider = ({
  children,
  language,
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
  const [authToken, setAuthToken] = useState<string | undefined>();
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
  const chain =
    (user ? activeWalletChain : undefined) ?? defineChain(defaultChainId);
  const tdk = useMemo(
    () =>
      new TDKAPI({
        baseUri: apiUri,
        chainId: chain.id,
        backendWallet: sessionOptions?.backendWallet,
        authToken,
        client,
        activeWallet,
      }),
    [
      apiUri,
      chain.id,
      sessionOptions?.backendWallet,
      authToken,
      client,
      activeWallet,
    ],
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

      const authMethod = getStoredAuthMethod();

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

      const properties = event.properties ?? {};
      properties.authentication = {
        method: authMethod ?? null,
        email: event.email ?? user?.email ?? null,
        external_wallet_addresses: event.externalWalletAddresses ?? [],
      };

      const trackableEvent: TrackableEvent = {
        ...playerId,
        name: event.name,
        properties: event.properties ?? {},
      };
      return AnalyticsManager.instance.trackCustomEvent(trackableEvent);
    },
    [userAddress, user],
  );

  const onAuthTokenUpdated = useCallback(
    (authToken: string) => {
      tdk.user.me({ overrideAuthToken: authToken }).then((user) => {
        setUser(user);
        setAuthToken(authToken);
        setStoredAuthToken(authToken);
        onConnect?.(user);
      });
    },
    [tdk.user.me, onConnect],
  );

  const {
    isUsingTreasureLauncher,
    isUsingLauncherAuthToken,
    openLauncherAccountModal,
    startUserSession: startUserSessionViaLauncher,
  } = useLauncher({
    launcherOptions,
    setRootElement: setEl,
    onAuthTokenUpdated,
  });

  const logOut = () => {
    if (analyticsOptions?.automaticTrackLogout !== false) {
      trackCustomEvent({
        name: EVT_TREASURECONNECT_DISCONNECTED,
        properties: {
          isUsingTreasureLauncher,
          isUsingLauncherAuthToken,
        },
      })
        .then((eventId) => {
          if (eventId) {
            console.debug(
              `[TreasureProvider] tracked logout event: ${eventId}`,
            );
          }
        })
        .catch((err) => {
          console.error(`[TreasureProvider] error tracking logout: ${err}`);
        });
    }
    setUser(undefined);
    setAuthToken(undefined);
    clearStoredAuthToken();
    clearStoredAuthMethod();
    activeWallet?.disconnect();
  };

  const logIn = async (
    wallet: Wallet,
    chainId?: number,
    authMethod?: string,
    skipCurrentUser = false,
  ): Promise<{ user: User | undefined; legacyProfiles: LegacyProfile[] }> => {
    if (isUsingLauncherAuthToken) {
      console.debug(
        "[TreasureProvider] Skipping login because launcher is being used",
      );
      return { user: undefined, legacyProfiles: [] };
    }

    if (chainId) {
      tdk.chainId = chainId;
    }

    let nextUser: User | undefined;
    let nextAuthToken: string | undefined;
    let legacyProfiles: LegacyProfile[] = [];

    // Check for existing stored auth token
    if (!skipCurrentUser) {
      const storedAuthToken = getStoredAuthToken();
      if (storedAuthToken) {
        // Validate if it's expired before attempting to use it
        try {
          const { exp: authTokenExpirationDate } =
            decodeAuthToken(storedAuthToken);
          if (authTokenExpirationDate > Date.now() / 1000) {
            setIsAuthenticating(true);
            nextUser = await tdk.user.me({
              overrideAuthToken: storedAuthToken,
            });
            nextAuthToken = storedAuthToken;
          }
        } catch (err) {
          console.debug(
            "[TreasureProvider] Error fetching user with stored auth token:",
            err,
          );
          // Ignore errors and proceed with login
        }
      }
    }

    if (!nextUser) {
      setIsAuthenticating(true);
      try {
        const result = await authenticateWallet({
          wallet,
          tdk,
          authTokenDurationSec:
            authOptions?.authTokenDurationSec ??
            sessionOptions?.sessionDurationSec,
        });
        nextAuthToken = result.token;
        nextUser = result.user;
        legacyProfiles = result.legacyProfiles;
      } catch (err) {
        setIsAuthenticating(false);
        throw err;
      }
    }

    if (!nextUser || !nextAuthToken) {
      throw new Error("An unknown error occurred during login");
    }

    // Set auth token on this instance of the TDK for the next request
    tdk.setAuthToken(nextAuthToken);

    // Start user session if configured and not on ZKsync chain
    if (
      sessionOptions &&
      !(await isZkSyncChain(chainId ? defineChain(chainId) : chain))
    ) {
      setIsAuthenticating(true);
      try {
        await startUserSession({
          client,
          wallet,
          chainId: chainId ?? chain.id,
          tdk,
          sessions: nextUser.sessions,
          options: sessionOptions,
        });
      } catch (err) {
        setIsAuthenticating(false);
        throw err;
      }
    }

    if (authMethod) {
      setStoredAuthMethod(authMethod);
    }

    // Update user state
    setUser(nextUser);
    setAuthToken(nextAuthToken);
    setStoredAuthToken(nextAuthToken);

    if (analyticsOptions?.automaticTrackLogin !== false) {
      trackCustomEvent({
        name: EVT_TREASURECONNECT_CONNECTED,
        email: nextUser.email,
        externalWalletAddresses: nextUser.externalWalletAddresses,
        address: nextUser.address,
        properties: {
          isUsingTreasureLauncher,
          isUsingLauncherAuthToken,
        },
      })
        .then((eventId) => {
          if (eventId) {
            console.debug(`[TreasureProvider] tracked login event: ${eventId}`);
          }
        })
        .catch((err) => {
          console.error(`[TreasureProvider] error tracking login: ${err}`);
        });
    }

    // Trigger completion callback
    onConnect?.(nextUser);

    setIsAuthenticating(false);
    return { user: nextUser, legacyProfiles };
  };

  const switchChain = async (chainId: number) => {
    if (activeWallet) {
      await switchActiveWalletChain(defineChain(chainId));
      await logIn(activeWallet, chainId, undefined, true);
    }
  };

  // Attempt an automatic background connection
  useAutoConnect({
    client,
    chain,
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
        language,
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
        isUsingLauncherAuthToken,
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

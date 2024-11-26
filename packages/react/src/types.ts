import type {
  AddressString,
  AppInfo,
  Contract,
  Device,
  EcosystemIdString,
  LegacyProfile,
  PropertyValue,
  SessionOptions,
  TDKAPI,
  TreasureConnectClient,
  User,
} from "@treasure-dev/tdk-core";
import type { ReactNode } from "react";
import type { Chain } from "thirdweb";
import type { Wallet } from "thirdweb/dist/types/exports/wallets";
import type { SupportedLanguage } from "./i18n";

export type AnalyticsEvent = {
  name: string;
  userId?: string;
  address?: string;
  properties?: { [key: string]: PropertyValue | PropertyValue[] };
};

type LauncherOptions = {
  getAuthTokenOverride?: () => string | undefined;
};

type AnalyticsOptions = {
  apiUri?: string;
  apiKey: string;
  appInfo: AppInfo;
  cartridgeTag: string;
  device?: Device;
};

export type Config = {
  language?: SupportedLanguage;
  appName: string;
  appIconUri?: string;
  apiUri?: string;
  defaultChainId?: number;
  clientId: string;
  ecosystemId?: EcosystemIdString;
  ecosystemPartnerId: string;
  autoConnectTimeout?: number;
  onConnect?: (
    user: User,
    startUserSession: (options: SessionOptions) => Promise<void>,
  ) => void;
  launcherOptions?: LauncherOptions;
  analyticsOptions?: AnalyticsOptions;
};

export type ContextValues = {
  appName: string;
  appIconUri?: string;
  chain: Chain;
  contractAddresses: Record<Contract, AddressString>;
  tdk: TDKAPI;
  client: TreasureConnectClient;
  ecosystemId: EcosystemIdString;
  ecosystemPartnerId: string;
  isConnecting: boolean;
  isUsingTreasureLauncher: boolean;
  logIn: (
    wallet: Wallet,
    chainId?: number,
  ) => Promise<{ user: User | undefined; legacyProfiles: LegacyProfile[] }>;
  logOut: () => void;
  updateUser: (user: Partial<User>) => void;
  startUserSession: (options: SessionOptions) => void;
  switchChain: (chainId: number) => void;
  setRootElement: (el: ReactNode) => void;
  openLauncherAccountModal: (size?: "lg" | "xl" | "2xl" | "3xl") => void;
  trackCustomEvent: (event: AnalyticsEvent) => Promise<string | undefined>;
} & (
  | {
      isConnected: false;
      user: undefined;
      userAddress: undefined;
      authToken: undefined;
    }
  | {
      isConnected: true;
      user: User;
      userAddress: string;
      authToken: string;
    }
);

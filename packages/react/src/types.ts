import type {
  AddressString,
  AppInfo,
  Contract,
  Device,
  EcosystemIdString,
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
  sessionOptions?: SessionOptions;
  autoConnectTimeout?: number;
  onConnect?: (user: User) => void;
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
  user?: User;
  isConnecting: boolean;
  logIn: (wallet: Wallet) => Promise<User | undefined>;
  logOut: () => void;
  startUserSession: (options: SessionOptions) => void;
  switchChain: (chainId: number) => void;
  setRootElement: (el: ReactNode) => void;
  isUsingTreasureLauncher: boolean;
  openLauncherAccountModal: (size?: "lg" | "xl" | "2xl" | "3xl") => void;
  trackCustomEvent: (event: AnalyticsEvent) => Promise<string>;
};

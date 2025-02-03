import type { WalletComponents } from "@treasure-dev/launcher";
import type {
  AddressString,
  AppInfo,
  AuthOptions,
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
import type { Language } from "./ui/hooks/useTranslation";

export type AnalyticsEvent = {
  name: string;
  userId?: string;
  address?: string;
  properties?: { [key: string]: PropertyValue | PropertyValue[] };
};

type LauncherOptions = {
  getAuthTokenOverride?: () => string | undefined;
  getWalletComponentsOverride?: () => WalletComponents | undefined;
};

type AnalyticsOptions = {
  apiUri?: string;
  apiKey: string;
  appInfo: AppInfo;
  automaticTrackLogin?: boolean;
  automaticTrackLogout?: boolean;
  cartridgeTag: string;
  device?: Device;
};

export type Config = {
  language?: Language;
  appName: string;
  appIconUri?: string;
  apiUri?: string;
  defaultChainId?: number;
  clientId: string;
  ecosystemId?: EcosystemIdString;
  ecosystemPartnerId: string;
  analyticsOptions?: AnalyticsOptions;
  authOptions?: AuthOptions;
  launcherOptions?: LauncherOptions;
  sessionOptions?: SessionOptions;
  autoConnectTimeout?: number;
  onConnect?: (user: User) => void;
};

export type ContextValues = {
  language?: Language;
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
  isUsingLauncherAuthToken: boolean;
  logIn: (
    wallet: Wallet,
    chainId?: number,
    skipCurrentUser?: boolean,
  ) => Promise<{ user: User | undefined; legacyProfiles: LegacyProfile[] }>;
  logOut: () => void;
  updateUser: (user: Partial<User>) => void;
  startUserSession: (options: SessionOptions) => void;
  switchChain: (chainId: number) => Promise<void>;
  setRootElement: (el: ReactNode) => void;
  openLauncherAccountModal: (size?: "lg" | "xl" | "2xl" | "3xl") => void;
  trackCustomEvent: (event: AnalyticsEvent) => Promise<string | undefined>;
} & (
  | {
      isConnected: false;
      user: undefined;
      userAddress: undefined;
    }
  | {
      isConnected: true;
      user: User;
      userAddress: string;
    }
);

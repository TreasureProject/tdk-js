export * from "./types";

export {
  ACCOUNT_FACTORY_ADDRESS,
  CONTRACT_ADDRESSES,
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_APP,
  DEFAULT_TDK_CHAIN_ID,
  DEFAULT_TDK_APP_NAME,
  DEFAULT_TDK_APP_ICON_URI,
  DEFAULT_TDK_ECOSYSTEM_ID,
  TOKEN_IDS,
  TREASURE_CONDUIT_KEYS,
  TREASURE_CHAIN_DEFINITION,
  TREASURE_TOPAZ_CHAIN_DEFINITION,
  USER_PROFILE_FREE_BANNER_URLS,
  treasure,
  treasureTopaz,
} from "./constants";
export { erc20Abi } from "./abis/erc20Abi";
export { erc721Abi } from "./abis/erc721Abi";
export { erc1155Abi } from "./abis/erc1155Abi";
export { harvesterAbi } from "./abis/harvesterAbi";
export { nftHandlerAbi } from "./abis/nftHandlerAbi";
export { magicswapV2RouterAbi } from "./abis/magicswapV2RouterAbi";
export { TDKAPI } from "./api";
export { sumArray } from "./utils/array";
export {
  getContractAddress,
  getContractAddresses,
} from "./utils/contracts";
export {
  getDateHoursFromNow,
  getDateDaysFromNow,
  getDateYearsFromNow,
} from "./utils/date";
export { fetchUserInventory } from "./utils/inventory";

// Connect
export {
  generateAccountSignature,
  verifyAccountSignature,
} from "./connect/auth";
export { decodeAuthToken } from "./connect/jwt";
export {
  type SocialConnectMethod,
  type ConnectMethod,
  SUPPORTED_WEB3_WALLETS,
  isSocialConnectMethod,
  connectEcosystemWallet,
  createTreasureConnectClient,
  sendEmailVerificationCode,
  authenticateWallet,
  logIn,
} from "./connect/login";
export {
  createSession,
  getUserSessions,
  startUserSession,
  validateSession,
} from "./connect/session";
export { getUserAddress } from "./connect/user";

// Bridgeworld
export {
  getHarvesterInfo,
  getHarvesterUserInfo,
} from "./bridgeworld/harvesters";

// Magicswap
export * from "./magicswap";

// Analytics
export { AnalyticsManager } from "./analytics/AnalyticsManager";
export type {
  AnalyticsPayload,
  AppInfo,
  Device,
  PropertyValue,
  TrackableEvent,
} from "./analytics/types";

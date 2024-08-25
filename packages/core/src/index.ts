export * from "./types";

export {
  CONTRACT_ADDRESSES,
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_APP,
  DEFAULT_TDK_CHAIN_ID,
  DEFAULT_TDK_APP_NAME,
  DEFAULT_TDK_APP_ICON_URI,
  TOKEN_IDS,
  TREASURE_CONDUIT_KEYS,
  TREASURE_RUBY_CHAIN_DEFINITION,
  treasureRuby,
} from "./constants";
export { erc20Abi } from "./abis/erc20Abi";
export { erc721Abi } from "./abis/erc721Abi";
export { erc1155Abi } from "./abis/erc1155Abi";
export { harvesterAbi } from "./abis/harvesterAbi";
export { nftHandlerAbi } from "./abis/nftHandlerAbi";
export { magicSwapV2RouterABI } from "./abis/magicSwapV2RouterAbi";
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
export { isSocialConnectMethod } from "./utils/connectMethods";

// Connect
export { getAllActiveSigners } from "./connect/accounts";
export { decodeAuthToken } from "./connect/jwt";
export {
  SUPPORTED_IN_APP_WALLET_OPTIONS,
  SUPPORTED_WEB3_WALLETS,
  connectWallet,
  createLoginUrl,
  createTreasureConnectClient,
  sendEmailVerificationCode,
  authenticateWallet,
  logIn,
  logInWithEmail,
  logInWithPasskey,
  logInWithSocial,
} from "./connect/login";
export {
  createSession,
  validateSession,
  startUserSession,
} from "./connect/session";

// Bridgeworld
export {
  fetchHarvesterCorruptionRemovalInfo,
  getHarvesterInfo,
  getHarvesterUserInfo,
} from "./bridgeworld/harvesters";

// Magicswap
export {
  fetchPools,
  fetchPool,
  getSwapRoute,
  getSwapArgs,
  getAddLiquidityArgs,
  getRemoveLiquidityArgs,
} from "./magicswap";

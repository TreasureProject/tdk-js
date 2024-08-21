import { erc20Abi, erc721Abi } from "viem";

export * from "./types";

export {
  CONTRACT_ADDRESSES,
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_APP,
  DEFAULT_TDK_CHAIN_ID,
  DEFAULT_TDK_APP_NAME,
  DEFAULT_TDK_APP_ICON_URI,
  SUPPORTED_CHAINS,
  SUPPORTED_CHAIN_IDS,
  TOKEN_IDS,
  TREASURE_CONDUIT_KEYS,
  TREASURE_RUBY_CHAIN_DEFINITION,
  treasureRuby,
} from "./constants";
export { erc20Abi };
export { erc721Abi };
export { erc1155Abi } from "./abis/erc1155Abi";
export { harvesterAbi } from "./abis/harvesterAbi";
export { nftHandlerAbi } from "./abis/nftHandlerAbi";
export { magicSwapV2RouterABI } from "./abis/magicSwapV2RouterAbi";
export { TDKAPI } from "./api";
export { truncateEthAddress } from "./utils/address";
export { sumArray } from "./utils/array";
export {
  getContractAddress,
  getContractAddresses,
} from "./utils/contracts";
export {
  formatAmount,
  formatUSD,
} from "./utils/currency";
export {
  getDateHoursFromNow,
  getDateDaysFromNow,
  getDateYearsFromNow,
} from "./utils/date";

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

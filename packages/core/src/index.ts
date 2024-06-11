import { erc20Abi, erc721Abi } from "viem";

export * from "./types";

export {
  CONTRACT_ADDRESSES,
  DEFAULT_TDK_API_BASE_URI,
  DEFAULT_TDK_APP,
  DEFAULT_TDK_CHAIN_ID,
  DEFAULT_TDK_LOGIN_DOMAIN,
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
export { paymentsModuleAbi } from "./abis/paymentsModuleAbi";
export { priceFeedAbi } from "./abis/priceFeedAbi";
export { TDKAPI } from "./api";
export { getAllActiveSigners } from "./utils/accounts";
export { truncateEthAddress } from "./utils/address";
export { sumArray } from "./utils/array";
export {
  getContractAddress,
  getContractAddresses,
  getTokenPriceFeedContract,
} from "./utils/contracts";
export {
  formatAmount,
  formatUSD,
  getCurrencyAddress,
  getTokenAddress,
} from "./utils/currency";
export {
  getDateHoursFromNow,
  getDateDaysFromNow,
  getDateYearsFromNow,
} from "./utils/date";
export {
  fetchHarvesterCorruptionRemovalInfo,
  getHarvesterInfo,
  getHarvesterUserInfo,
} from "./utils/harvesters";
export { decodeAuthToken } from "./utils/jwt";
export { createLoginUrl } from "./utils/login";
export { PaymentsPriceType, getPaymentsPriceType } from "./utils/payments";
export {
  createSession,
  isSessionRequired,
  validateSession,
} from "./utils/session";

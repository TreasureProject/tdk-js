import { getContractAddress } from "@treasure-dev/tdk-core";
import { toWei } from "thirdweb";
import { arbitrumSepolia } from "thirdweb/chains";

const TREASURY_ADDRESS = "0xE647b2c46365741e85268ceD243113d08F7E00B8";

export const SESSION_OPTIONS_BY_CHAIN_ID = {
  [arbitrumSepolia.id]: {
    backendWallet: import.meta.env.VITE_TDK_BACKEND_WALLET,
    approvedTargets: [
      getContractAddress(arbitrumSepolia.id, "MAGIC"),
      TREASURY_ADDRESS,
    ],
    nativeTokenLimitPerTransaction: toWei("1"),
  },
};

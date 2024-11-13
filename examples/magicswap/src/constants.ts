import { getContractAddresses } from "@treasure-dev/tdk-core";
import { arbitrumSepolia } from "thirdweb/chains";

const arbitrumSepoliaContracts = getContractAddresses(arbitrumSepolia.id);

export const SESSION_OPTIONS_BY_CHAIN_ID = {
  [arbitrumSepolia.id]: {
    backendWallet: import.meta.env.VITE_TDK_BACKEND_WALLET,
    approvedTargets: [
      arbitrumSepoliaContracts.MAGIC,
      arbitrumSepoliaContracts.Treasures,
      arbitrumSepoliaContracts.MagicswapV2Router,
      "0x0626699bc82858c16ae557b2eaad03a58cfcc8bd", // MAGIC-Treasures MLP
    ],
  },
};

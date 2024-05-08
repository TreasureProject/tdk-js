import { createConfig, http } from "@wagmi/core";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "viem/chains";

import { SUPPORTED_CHAINS } from "../constants";

export const DEFAULT_WAGMI_CONFIG = createConfig({
  chains: SUPPORTED_CHAINS,
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

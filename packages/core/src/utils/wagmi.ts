import { createConfig, http } from "@wagmi/core";
import { arbitrum, arbitrumSepolia } from "viem/chains";

import { SUPPORTED_CHAINS } from "../constants";

export const config = createConfig({
  chains: SUPPORTED_CHAINS,
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});

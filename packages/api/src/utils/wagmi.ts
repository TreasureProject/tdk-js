import { createConfig, http } from "@wagmi/core";
import { arbitrum, arbitrumSepolia } from "viem/chains";

export const SUPPORTED_CHAINS = [arbitrum, arbitrumSepolia] as const;

export const config = createConfig({
  chains: SUPPORTED_CHAINS,
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});

import { createConfig, http } from "@wagmi/core";
import { arbitrumSepolia } from "@wagmi/core/chains";

export const config = createConfig({
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
});

import { createConfig, http } from "@wagmi/core";
import type { Transport } from "viem";

import { SUPPORTED_CHAINS } from "../constants";
import type { SupportedChainId } from "../types";

export const DEFAULT_WAGMI_CONFIG = createConfig({
  chains: SUPPORTED_CHAINS,
  transports: SUPPORTED_CHAINS.reduce(
    (acc, chain) => {
      acc[chain.id] = http();
      return acc;
    },
    {} as Record<SupportedChainId, Transport>,
  ),
});

const CHAIN_ID_TO_RPCS_MAPPING = {
  42161: ["https://arb1.arbitrum.io/rpc"],
} as const;

export const getRpcsByChainId = (chainId: number) => {
  if (chainId in CHAIN_ID_TO_RPCS_MAPPING) {
    return CHAIN_ID_TO_RPCS_MAPPING[
      chainId as keyof typeof CHAIN_ID_TO_RPCS_MAPPING
    ];
  }

  return CHAIN_ID_TO_RPCS_MAPPING[42161];
};

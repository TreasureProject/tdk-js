import type { Token } from "@treasure/tdk-core";
import { getTokenPriceFeedContract, priceFeedABI } from "@treasure/tdk-core";
import { formatUnits } from "viem";
import { useContractReads } from "wagmi";

import { useContractAddresses } from "./useContractAddress";

type Props = {
  tokens: Token[];
  enabled?: boolean;
};

export const useTokenPrices = ({ tokens, enabled = true }: Props) => {
  const contractAddresses = useContractAddresses();
  const { data, ...result } = useContractReads({
    contracts: tokens.map((token) => {
      const priceFeed = getTokenPriceFeedContract(token);
      if (!priceFeed) {
        return undefined;
      }

      return {
        address: contractAddresses[priceFeed],
        abi: priceFeedABI,
        functionName: "latestAnswer",
      };
    }),
    enabled,
  });
  return {
    data:
      data?.map(({ result }) =>
        Number(formatUnits((result ?? 0n) as bigint, 8)),
      ) ?? [],
    ...result,
  };
};

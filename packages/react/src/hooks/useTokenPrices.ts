import type { Token } from "@treasure-dev/tdk-core";
import {
  getTokenPriceFeedContract,
  priceFeedAbi,
} from "@treasure-dev/tdk-core";
import { formatUnits } from "viem";
import { useReadContracts } from "wagmi";

import { useContractAddresses } from "./useContractAddress";

type Props = {
  tokens: Token[];
  enabled?: boolean;
};

export const useTokenPrices = ({ tokens, enabled = true }: Props) => {
  const contractAddresses = useContractAddresses();
  const { data, ...result } = useReadContracts({
    contracts: tokens.map((token) => {
      const priceFeed = getTokenPriceFeedContract(token);
      return {
        address: contractAddresses[priceFeed!],
        abi: priceFeedAbi,
        functionName: "latestAnswer",
      };
    }),
    query: { enabled },
  });
  return {
    data:
      data?.map(({ result }) =>
        Number(formatUnits((result ?? 0n) as bigint, 8)),
      ) ?? [],
    ...result,
  };
};

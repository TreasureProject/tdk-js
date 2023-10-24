import type { Token } from "@treasure/core";
import { erc20ABI, getTokenAddress } from "@treasure/core";
import { formatUnits } from "viem";
import { useAccount, useChainId, useContractReads } from "wagmi";

type Props = {
  tokens: Token[];
  enabled?: boolean;
};

export const useTokenBalances = ({ tokens, enabled = true }: Props) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data, ...result } = useContractReads({
    contracts: tokens.map((token) => ({
      address: getTokenAddress(chainId, token),
      abi: erc20ABI,
      functionName: "balanceOf",
      args: [address!],
    })),
    enabled: enabled && !!address,
  });
  return {
    data:
      data?.map(
        ({ result }) => Number(formatUnits((result ?? 0n) as bigint, 18)), // TODO: don't assume 18 decimals
      ) ?? [],
    ...result,
  };
};

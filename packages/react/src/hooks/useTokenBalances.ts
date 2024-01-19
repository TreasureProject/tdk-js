import type { AddressString, Token } from "@treasure/tdk-core";
import { erc20ABI, getTokenAddress } from "@treasure/tdk-core";
import { formatUnits } from "viem";
import { useAccount, useChainId, useContractReads } from "wagmi";

type Props = {
  tokens: Token[];
  address?: AddressString;
  chainId?: number;
  enabled?: boolean;
};

export const useTokenBalances = ({
  tokens,
  address: addressOverride,
  chainId: chainIdOverride,
  enabled = true,
}: Props) => {
  const { address: connectedAddress } = useAccount();
  const connectedChainId = useChainId();
  const address = addressOverride ?? connectedAddress;
  const chainId = chainIdOverride ?? connectedChainId;

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

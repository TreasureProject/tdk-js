import {
  type AddressString,
  type Token,
  erc20Abi,
  getTokenAddress,
} from "@treasure/tdk-core";
import { formatUnits } from "viem";
import { useAccount, useChainId, useReadContracts } from "wagmi";

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

  const { data, ...result } = useReadContracts({
    contracts: tokens.map((token) => ({
      address: getTokenAddress(chainId, token),
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address!],
    })),
    query: {
      enabled: enabled && !!address,
    },
  });

  return {
    data:
      data?.map(
        ({ result }) => Number(formatUnits((result ?? 0n) as bigint, 18)), // TODO: don't assume 18 decimals
      ) ?? [],
    ...result,
  };
};

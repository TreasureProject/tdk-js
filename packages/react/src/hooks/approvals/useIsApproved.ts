import { erc1155ABI } from "@treasure/tdk-core";
import type { AddressString, TokenStandard } from "@treasure/tdk-core";
import { erc20ABI, erc721ABI, useAccount, useContractRead } from "wagmi";

type Props = {
  contractAddress: string;
  operatorAddress: string;
  type?: TokenStandard;
  amount?: bigint;
  enabled?: boolean;
};

export const useIsApproved = ({
  contractAddress,
  operatorAddress,
  type = "ERC20",
  amount = 0n,
  enabled = true,
}: Props) => {
  const { address, isConnected } = useAccount();
  const isEnabled = enabled && isConnected;

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: contractAddress as AddressString,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address!, operatorAddress as AddressString],
    enabled: isEnabled && type === "ERC20",
  });

  const {
    data: erc721IsApprovedForAll,
    refetch: refetchERC721IsApprovedForAll,
  } = useContractRead({
    address: contractAddress as AddressString,
    abi: erc721ABI,
    functionName: "isApprovedForAll",
    args: [address!, operatorAddress as AddressString],
    enabled: isEnabled && type === "ERC721",
  });

  const {
    data: erc1155IsApprovedForAll,
    refetch: refetchERC1155IsApprovedForAll,
  } = useContractRead({
    address: contractAddress as AddressString,
    abi: erc1155ABI,
    functionName: "isApprovedForAll",
    args: [address!, operatorAddress as AddressString],
    enabled: isEnabled && type === "ERC721",
  });

  return {
    isApproved:
      !!erc721IsApprovedForAll ||
      !!erc1155IsApprovedForAll ||
      (!!allowance && allowance >= amount),
    refetch:
      type === "ERC20"
        ? refetchAllowance
        : type === "ERC721"
          ? refetchERC721IsApprovedForAll
          : refetchERC1155IsApprovedForAll,
  };
};

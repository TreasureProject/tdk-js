import { type AddressString, TokenStandard, erc1155ABI } from "@treasure/core";
import { useCallback } from "react";
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
  const isERC20Enabled = isEnabled && type === "ERC20";
  const isERC721Enabled = isEnabled && type === "ERC721";
  const isERC1155Enabled = isEnabled && type === "ERC1155";

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: contractAddress as AddressString,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address!, operatorAddress as AddressString],
    enabled: isERC20Enabled,
  });

  const {
    data: erc721IsApprovedForAll,
    refetch: refetchERC721IsApprovedForAll,
  } = useContractRead({
    address: contractAddress as AddressString,
    abi: erc721ABI,
    functionName: "isApprovedForAll",
    args: [address!, operatorAddress as AddressString],
    enabled: isERC721Enabled,
  });

  const {
    data: erc1155IsApprovedForAll,
    refetch: refetchERC1155IsApprovedForAll,
  } = useContractRead({
    address: contractAddress as AddressString,
    abi: erc1155ABI,
    functionName: "isApprovedForAll",
    args: [address!, operatorAddress as AddressString],
    enabled: isERC1155Enabled,
  });

  const refetch = useCallback(() => {
    if (isERC20Enabled) {
      refetchAllowance();
    }

    if (isERC721Enabled) {
      refetchERC721IsApprovedForAll();
    }

    if (isERC1155Enabled) {
      refetchERC1155IsApprovedForAll();
    }
  }, [
    isERC20Enabled,
    isERC721Enabled,
    isERC1155Enabled,
    refetchAllowance,
    refetchERC721IsApprovedForAll,
    refetchERC1155IsApprovedForAll,
  ]);

  return {
    isApproved:
      !!erc721IsApprovedForAll ||
      !!erc1155IsApprovedForAll ||
      (!!allowance && allowance >= amount),
    refetch,
  };
};

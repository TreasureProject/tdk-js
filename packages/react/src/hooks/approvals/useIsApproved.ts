import {
  type AddressString,
  type TokenStandard,
  erc20Abi,
  erc721Abi,
  erc1155Abi,
} from "@treasure-dev/tdk-core";
import { useAccount, useReadContract } from "wagmi";

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

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contractAddress as AddressString,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address!, operatorAddress as AddressString],
    query: {
      enabled: isEnabled && type === "ERC20",
    },
  });

  const {
    data: erc721IsApprovedForAll,
    refetch: refetchERC721IsApprovedForAll,
  } = useReadContract({
    address: contractAddress as AddressString,
    abi: erc721Abi,
    functionName: "isApprovedForAll",
    args: [address!, operatorAddress as AddressString],
    query: {
      enabled: isEnabled && type === "ERC721",
    },
  });

  const {
    data: erc1155IsApprovedForAll,
    refetch: refetchERC1155IsApprovedForAll,
  } = useReadContract({
    address: contractAddress as AddressString,
    abi: erc1155Abi,
    functionName: "isApprovedForAll",
    args: [address!, operatorAddress as AddressString],
    query: {
      enabled: isEnabled && type === "ERC1155",
    },
  });

  return {
    allowance,
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

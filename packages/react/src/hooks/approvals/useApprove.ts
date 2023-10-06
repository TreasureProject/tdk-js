import {
  AddressString,
  OnErrorFn,
  OnSuccessFn,
  TokenStandard,
  erc1155ABI,
} from "@treasure/core";
import { useEffect } from "react";
import {
  erc20ABI,
  erc721ABI,
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

type Props = {
  contractAddress: string;
  operatorAddress: string;
  type?: TokenStandard;
  amount?: bigint;
  enabled?: boolean;
  onSuccess?: OnSuccessFn;
  onError?: OnErrorFn;
};

export const useApprove = ({
  contractAddress,
  operatorAddress,
  type = "ERC20",
  amount = 0n,
  enabled = true,
  onSuccess,
  onError,
}: Props) => {
  const { address } = useAccount();
  const isEnabled = !!address && enabled;

  const { config: erc20ApproveConfig } = usePrepareContractWrite({
    address: contractAddress as AddressString,
    abi: erc20ABI,
    functionName: "approve",
    args: [operatorAddress as AddressString, amount],
    enabled: isEnabled && type === "ERC20",
  });
  const erc20Approve = useContractWrite(erc20ApproveConfig);
  const erc20ApproveResult = useWaitForTransaction(erc20Approve.data);

  const { config: erc721ApproveConfig } = usePrepareContractWrite({
    address: contractAddress as AddressString,
    abi: erc721ABI,
    functionName: "setApprovalForAll",
    args: [operatorAddress as AddressString, true],
    enabled: isEnabled && type === "ERC721",
  });
  const erc721Approve = useContractWrite(erc721ApproveConfig);
  const erc721ApproveResult = useWaitForTransaction(erc721Approve.data);

  const { config: erc1155ApproveConfig } = usePrepareContractWrite({
    address: contractAddress as AddressString,
    abi: erc1155ABI,
    functionName: "setApprovalForAll",
    args: [operatorAddress as AddressString, true],
    enabled: isEnabled && type === "ERC1155",
  });
  const erc1155Approve = useContractWrite(erc1155ApproveConfig);
  const erc1155ApproveResult = useWaitForTransaction(erc1155Approve.data);

  const result = erc721Approve.write
    ? erc721ApproveResult
    : erc1155Approve.write
    ? erc1155ApproveResult
    : erc20Approve.write
    ? erc20ApproveResult
    : undefined;

  useEffect(() => {
    if (result?.isSuccess) {
      onSuccess?.();
    } else if (result?.isError) {
      onError?.(result.error || undefined);
    }
  }, [result, onSuccess, onError]);

  return {
    approve: isEnabled
      ? erc721Approve.write ?? erc1155Approve.write ?? erc20Approve.write
      : undefined,
  };
};

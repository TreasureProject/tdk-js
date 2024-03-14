import {
  type AddressString,
  type OnErrorFn,
  type OnSuccessFn,
  erc721Abi,
} from "@treasure-dev/tdk-core";
import { useEffect } from "react";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

type Props = {
  contractAddress: string;
  operatorAddress: string;
  enabled?: boolean;
  onSuccess?: OnSuccessFn;
  onError?: OnErrorFn;
};

export const useApproveERC721 = ({
  contractAddress,
  operatorAddress,
  enabled = true,
  onSuccess,
  onError,
}: Props) => {
  const { address } = useAccount();
  const isEnabled = !!address && enabled;

  const { data, refetch } = useSimulateContract({
    address: contractAddress as AddressString,
    abi: erc721Abi,
    functionName: "setApprovalForAll",
    args: [operatorAddress as AddressString, true],
    query: {
      enabled: isEnabled,
    },
  });
  const { writeContract, isPending, error: writeError } = useWriteContract();
  const {
    isLoading,
    isSuccess,
    error: resultError,
  } = useWaitForTransactionReceipt(data);
  const error = writeError ?? resultError;

  useEffect(() => {
    if (isEnabled) {
      if (isSuccess) {
        onSuccess?.();
        refetch();
      } else if (error) {
        onError?.(error);
        refetch();
      }
    }
  }, [refetch, isEnabled, isSuccess, error, onSuccess, onError]);

  return {
    isLoading: isPending || isLoading,
    approve:
      isEnabled && data?.request
        ? () => writeContract(data.request)
        : undefined,
  };
};

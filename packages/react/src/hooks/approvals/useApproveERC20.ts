import {
  type AddressString,
  type OnErrorFn,
  type OnSuccessFn,
  erc20Abi,
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
  amount?: bigint;
  enabled?: boolean;
  onSuccess?: OnSuccessFn;
  onError?: OnErrorFn;
};

export const useApproveERC20 = ({
  contractAddress,
  operatorAddress,
  amount = 0n,
  enabled = true,
  onSuccess,
  onError,
}: Props) => {
  const { address } = useAccount();
  const isEnabled = !!address && enabled;

  const { data, refetch } = useSimulateContract({
    address: contractAddress as AddressString,
    abi: erc20Abi,
    functionName: "approve",
    args: [operatorAddress as AddressString, amount],
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

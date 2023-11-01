import type { OnErrorFn, OnSuccessFn, TokenStandard } from "@treasure/core";
import { useCallback } from "react";

import { useApprove } from "./useApprove";
import { useIsApproved } from "./useIsApproved";

type Props = {
  contractAddress: string;
  operatorAddress: string;
  type?: TokenStandard;
  amount?: bigint;
  enabled?: boolean;
  onSuccess?: OnSuccessFn;
  onError?: OnErrorFn;
};

export const useApproval = ({
  contractAddress,
  operatorAddress,
  type,
  amount,
  enabled,
  onSuccess,
  onError,
}: Props) => {
  const { isApproved, refetch } = useIsApproved({
    contractAddress,
    operatorAddress,
    type,
    amount,
    enabled,
  });

  const onSuccessCallback = useCallback(() => {
    onSuccess?.();
    refetch();
  }, [onSuccess, refetch]);

  const { isLoading, approve } = useApprove({
    contractAddress,
    operatorAddress,
    type,
    amount,
    enabled: enabled && !isApproved,
    onSuccess: onSuccessCallback,
    onError,
  });

  return {
    isApproved,
    isLoading,
    approve,
    refetch,
  };
};

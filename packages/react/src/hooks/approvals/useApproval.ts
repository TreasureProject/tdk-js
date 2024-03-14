import type {
  OnErrorFn,
  OnSuccessFn,
  TokenStandard,
} from "@treasure-dev/tdk-core";
import { useCallback } from "react";

import { useApproveERC20 } from "./useApproveERC20";
import { useApproveERC721 } from "./useApproveERC721";
import { useApproveERC1155 } from "./useApproveERC1155";
import { useIsApproved } from "./useIsApproved";

type Props = {
  contractAddress: string;
  operatorAddress: string;
  type: TokenStandard;
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
  const { allowance, isApproved, refetch } = useIsApproved({
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

  const isEnabled = enabled && !isApproved;

  const approveERC20 = useApproveERC20({
    contractAddress,
    operatorAddress,
    amount,
    enabled: isEnabled && type === "ERC20",
    onSuccess: onSuccessCallback,
    onError,
  });

  const approveERC721 = useApproveERC721({
    contractAddress,
    operatorAddress,
    enabled: isEnabled && type === "ERC721",
    onSuccess: onSuccessCallback,
    onError,
  });

  const approveERC1155 = useApproveERC1155({
    contractAddress,
    operatorAddress,
    enabled: isEnabled && type === "ERC1155",
    onSuccess: onSuccessCallback,
    onError,
  });

  const { isLoading, approve } = (() => {
    switch (type) {
      case "ERC20":
        return approveERC20;
      case "ERC721":
        return approveERC721;
      case "ERC1155":
        return approveERC1155;
    }
  })();

  return {
    allowance,
    isApproved,
    isLoading,
    approve,
    refetch,
  };
};

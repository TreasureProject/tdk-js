import type {
  AddressString,
  OnErrorFn,
  OnSuccessFn,
  TokenStandard,
} from "@treasure/core";
import { erc1155ABI } from "@treasure/core";
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

  const preparedERC20 = usePrepareContractWrite({
    address: contractAddress as AddressString,
    abi: erc20ABI,
    functionName: "approve",
    args: [operatorAddress as AddressString, amount],
    enabled: isEnabled && type === "ERC20",
  });
  const writeERC20 = useContractWrite(preparedERC20.config);
  const resultERC20 = useWaitForTransaction(writeERC20.data);

  const preparedERC721 = usePrepareContractWrite({
    address: contractAddress as AddressString,
    abi: erc721ABI,
    functionName: "setApprovalForAll",
    args: [operatorAddress as AddressString, true],
    enabled: isEnabled && type === "ERC721",
  });
  const writeERC721 = useContractWrite(preparedERC721.config);
  const resultERC721 = useWaitForTransaction(writeERC721.data);

  const preparedERC1155 = usePrepareContractWrite({
    address: contractAddress as AddressString,
    abi: erc1155ABI,
    functionName: "setApprovalForAll",
    args: [operatorAddress as AddressString, true],
    enabled: isEnabled && type === "ERC1155",
  });
  const writeERC1155 = useContractWrite(preparedERC1155.config);
  const resultERC1155 = useWaitForTransaction(writeERC1155.data);

  const [
    { refetch: refetchPrepared },
    { isLoading: writeIsLoading, error: writeError, write },
    {
      data,
      isLoading: resultIsLoading = false,
      isSuccess = false,
      error: resultError,
    },
  ] = (() => {
    switch (type) {
      case "ERC20":
        return [preparedERC20, writeERC20, resultERC20];
      case "ERC721":
        return [preparedERC721, writeERC721, resultERC721];
      case "ERC1155":
        return [preparedERC1155, writeERC1155, resultERC1155];
    }
  })();
  const error = writeError || resultError;

  useEffect(() => {
    if (isEnabled) {
      if (isSuccess) {
        onSuccess?.(data);
        refetchPrepared();
      } else if (error) {
        onError?.(error);
        refetchPrepared();
      }
    }
  }, [data, refetchPrepared, isEnabled, isSuccess, error, onSuccess, onError]);

  return {
    isLoading: writeIsLoading || resultIsLoading,
    approve: isEnabled ? write : undefined,
  };
};

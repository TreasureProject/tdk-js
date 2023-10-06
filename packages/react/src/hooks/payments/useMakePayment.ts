import {
  AddressString,
  OnErrorFn,
  OnSuccessFn,
  PaymentsPriceType,
  PaymentsToken,
  getPaymentsPriceType,
  getPaymentsTokenAddress,
  paymentsModuleABI,
} from "@treasure/core";
import { useCallback, useEffect, useRef } from "react";
import {
  useChainId,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import { useApproval } from "../approvals/useApproval";
import { useTreasureContractAddress } from "../useTreasureContractAddress";

type Params = {
  paymentToken: PaymentsToken;
  pricedToken: PaymentsToken | "USD";
  pricedAmount: bigint;
  calculatedPaymentAmount: bigint;
  recipient: string;
  enabled?: boolean;
  onSuccess?: OnSuccessFn;
  onError?: OnErrorFn;
};

export const useMakePayment = ({
  paymentToken,
  pricedToken,
  pricedAmount,
  calculatedPaymentAmount,
  recipient,
  enabled = true,
  onSuccess,
  onError,
}: Params) => {
  const didApprove = useRef(false);
  const chainId = useChainId();
  const { address } = useTreasureContractAddress("PaymentsModule");
  const paymentTokenAddress = getPaymentsTokenAddress(chainId, paymentToken);
  const pricedTokenAddress = getPaymentsTokenAddress(chainId, pricedToken);
  const priceType = getPaymentsPriceType(paymentToken, pricedToken);
  const isPaymentTokenGas = paymentToken === "GAS";

  const { config: configStatic } = usePrepareContractWrite({
    address,
    abi: paymentsModuleABI,
    functionName: "makeStaticERC20Payment",
    args: [recipient as AddressString, paymentTokenAddress, pricedAmount],
    enabled:
      enabled && priceType === PaymentsPriceType.STATIC && !isPaymentTokenGas,
  });
  const writeStatic = useContractWrite(configStatic);
  const resultStatic = useWaitForTransaction(writeStatic.data);

  const { config: configStaticGas } = usePrepareContractWrite({
    address,
    abi: paymentsModuleABI,
    functionName: "makeStaticGasTokenPayment",
    args: [recipient as AddressString, pricedAmount],
    value: pricedAmount,
    enabled:
      enabled && priceType === PaymentsPriceType.STATIC && isPaymentTokenGas,
  });
  const writeStaticGas = useContractWrite(configStaticGas);
  const resultStaticGas = useWaitForTransaction(writeStaticGas.data);

  const { config: configPriceType } = usePrepareContractWrite({
    address,
    abi: paymentsModuleABI,
    functionName: "makeERC20PaymentByPriceType",
    args: [
      recipient as AddressString,
      paymentTokenAddress,
      pricedAmount,
      priceType,
      pricedTokenAddress,
    ],
    enabled:
      enabled && priceType !== PaymentsPriceType.STATIC && !isPaymentTokenGas,
  });
  const writePriceType = useContractWrite(configPriceType);
  const resultPriceType = useWaitForTransaction(writePriceType.data);

  const { config: configPriceTypeGas } = usePrepareContractWrite({
    address,
    abi: paymentsModuleABI,
    functionName: "makeGasTokenPaymentByPriceType",
    args: [
      recipient as AddressString,
      pricedAmount,
      priceType,
      pricedTokenAddress,
    ],
    value: pricedAmount,
    enabled:
      enabled && priceType !== PaymentsPriceType.STATIC && isPaymentTokenGas,
  });
  const writePriceTypeGas = useContractWrite(configPriceTypeGas);
  const resultPriceTypeGas = useWaitForTransaction(writePriceTypeGas.data);

  const result = writeStatic
    ? resultStatic
    : writeStaticGas
    ? resultStaticGas
    : writePriceType
    ? resultPriceType
    : writePriceTypeGas
    ? resultPriceTypeGas
    : undefined;

  const write =
    writeStatic.write ??
    writeStaticGas.write ??
    writePriceType.write ??
    writePriceTypeGas.write;

  const { approve, isApproved } = useApproval({
    contractAddress: paymentTokenAddress,
    operatorAddress: address,
    type: "ERC20",
    amount: calculatedPaymentAmount,
    enabled: enabled && !isPaymentTokenGas,
    onSuccess: useCallback(() => {
      didApprove.current = true;
    }, []),
    onError,
  });

  // Automatically call write if user just approved
  useEffect(() => {
    if (write && didApprove.current) {
      write();
    }
  }, [write]);

  // Check result for success or error status
  useEffect(() => {
    if (result?.isSuccess) {
      onSuccess?.();
    } else if (result?.isError) {
      onError?.(result.error || undefined);
    }
  }, [result, onSuccess, onError]);

  return {
    approve,
    isApproved,
    canSubmit: isApproved ? !!write : !!approve,
    makePayment: () => {
      if (isApproved) {
        write?.();
      } else {
        approve?.();
      }
    },
  };
};

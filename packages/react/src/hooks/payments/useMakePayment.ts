import type {
  // AddressString,
  Currency,
  OnErrorFn,
  OnSuccessFn,
  Token,
} from "@treasure/tdk-core";

// import {
//   PaymentsPriceType,
//   getCurrencyAddress,
//   getPaymentsPriceType,
//   getTokenAddress,
//   paymentsModuleABI,
// } from "@treasure/tdk-core";
// import { useCallback, useEffect, useRef } from "react";
// import {
//   useChainId,
//   useContractWrite,
//   usePrepareContractWrite,
//   useWaitForTransaction,
// } from "wagmi";

// import { useApproval } from "../approvals/useApproval";
// import { useContractAddress } from "../useContractAddress";

type Params = {
  paymentToken: Token;
  pricedCurrency: Currency;
  pricedAmount: bigint;
  calculatedPaymentAmount: bigint;
  recipient: string;
  enabled?: boolean;
  onSuccess?: OnSuccessFn;
  onError?: OnErrorFn;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useMakePayment = (params: Params) => {
  // export const useMakePayment = ({
  //   paymentToken,
  //   pricedCurrency,
  //   pricedAmount,
  //   calculatedPaymentAmount,
  //   recipient,
  //   enabled = true,
  //   onSuccess,
  //   onError,
  // }: Params) => {
  // const didApprove = useRef(false);
  // const chainId = useChainId();
  // const { address } = useContractAddress("PaymentsModule");
  // const paymentTokenAddress = getTokenAddress(chainId, paymentToken);
  // const pricedCurrencyAddress = getCurrencyAddress(chainId, pricedCurrency);
  // const priceType = getPaymentsPriceType(paymentToken, pricedCurrency);
  // const isPaymentTokenGas = paymentToken === "ETH";

  // const {
  //   approve,
  //   isApproved: isERC20Approved,
  //   isLoading: isApproveLoading,
  //   refetch: refetchApproval,
  // } = useApproval({
  //   contractAddress: paymentTokenAddress,
  //   operatorAddress: address,
  //   type: "ERC20",
  //   amount: calculatedPaymentAmount,
  //   enabled: enabled && !isPaymentTokenGas,
  //   onSuccess: useCallback(() => {
  //     didApprove.current = true;
  //   }, []),
  //   onError,
  // });

  // const isApproved = isERC20Approved || isPaymentTokenGas;
  // const isEnabled = enabled && isApproved;
  // const type =
  //   priceType === PaymentsPriceType.STATIC
  //     ? isPaymentTokenGas
  //       ? "staticGas"
  //       : "static"
  //     : isPaymentTokenGas
  //       ? "priceTypeGas"
  //       : "priceType";

  // const preparedStatic = usePrepareContractWrite({
  //   address,
  //   abi: paymentsModuleABI,
  //   functionName: "makeStaticERC20Payment",
  //   args: [recipient as AddressString, paymentTokenAddress, pricedAmount],
  //   enabled: isEnabled && type === "static",
  // });
  // const writeStatic = useContractWrite(preparedStatic.config);
  // const resultStatic = useWaitForTransaction(writeStatic.data);

  // const preparedStaticGas = usePrepareContractWrite({
  //   address,
  //   abi: paymentsModuleABI,
  //   functionName: "makeStaticGasTokenPayment",
  //   args: [recipient as AddressString, pricedAmount],
  //   value: calculatedPaymentAmount,
  //   enabled: isEnabled && type === "staticGas",
  // });
  // const writeStaticGas = useContractWrite(preparedStaticGas.config);
  // const resultStaticGas = useWaitForTransaction(writeStaticGas.data);

  // const preparedPriceType = usePrepareContractWrite({
  //   address,
  //   abi: paymentsModuleABI,
  //   functionName: "makeERC20PaymentByPriceType",
  //   args: [
  //     recipient as AddressString,
  //     paymentTokenAddress,
  //     pricedAmount,
  //     priceType,
  //     pricedCurrencyAddress,
  //   ],
  //   enabled: isEnabled && type === "priceType",
  // });
  // const writePriceType = useContractWrite(preparedPriceType.config);
  // const resultPriceType = useWaitForTransaction(writePriceType.data);

  // const preparedPriceTypeGas = usePrepareContractWrite({
  //   address,
  //   abi: paymentsModuleABI,
  //   functionName: "makeGasTokenPaymentByPriceType",
  //   args: [
  //     recipient as AddressString,
  //     pricedAmount,
  //     priceType,
  //     pricedCurrencyAddress,
  //   ],
  //   value: calculatedPaymentAmount,
  //   enabled: isEnabled && type === "priceTypeGas",
  // });
  // const writePriceTypeGas = useContractWrite(preparedPriceTypeGas.config);
  // const resultPriceTypeGas = useWaitForTransaction(writePriceTypeGas.data);

  // const [
  //   { refetch: refetchPrepared },
  //   { isLoading: writeIsLoading, error: writeError, write },
  //   {
  //     data,
  //     isLoading: resultIsLoading = false,
  //     isSuccess = false,
  //     error: resultError,
  //   },
  // ] = (() => {
  //   switch (type) {
  //     case "static":
  //       return [preparedStatic, writeStatic, resultStatic];
  //     case "staticGas":
  //       return [preparedStaticGas, writeStaticGas, resultStaticGas];
  //     case "priceType":
  //       return [preparedPriceType, writePriceType, resultPriceType];
  //     case "priceTypeGas":
  //       return [preparedPriceTypeGas, writePriceTypeGas, resultPriceTypeGas];
  //   }
  // })();
  // const error = writeError || resultError;

  // const refetch = useCallback(async () => {
  //   didApprove.current = false;
  //   await refetchApproval();
  //   await refetchPrepared();
  // }, [refetchApproval, refetchPrepared]);

  // useEffect(() => {
  //   if (isEnabled) {
  //     if (isSuccess) {
  //       onSuccess?.(data);
  //       refetch();
  //     } else if (error) {
  //       onError?.(error);
  //       refetch();
  //     }
  //   }
  // }, [data, refetch, isEnabled, isSuccess, error, onSuccess, onError]);

  // // Automatically call write the first time a user approves
  // useEffect(() => {
  //   if (isEnabled && write && didApprove.current) {
  //     write();
  //     didApprove.current = false;
  //   }
  // }, [isEnabled, write]);

  // return {
  //   isApproved,
  //   isLoading: isApproveLoading || !!writeIsLoading || !!resultIsLoading,
  //   approve,
  //   makePayment: enabled ? (isApproved ? write : approve) : undefined,
  // };
  return {
    isApproved: false,
    isLoading: false,
    approve: undefined,
    makePayment: undefined,
  };
};

import type { Currency, Token } from "@treasure/tdk-core";
import {
  getCurrencyAddress,
  getPaymentsPriceType,
  getTokenAddress,
  paymentsModuleABI,
} from "@treasure/tdk-core";
import { useChainId, useContractRead } from "wagmi";

import { useContractAddress } from "../useContractAddress";

type Params = {
  paymentToken: Token;
  pricedCurrency: Currency;
  pricedAmount: bigint;
  enabled?: boolean;
};

export const useCalculatePaymentAmount = ({
  paymentToken,
  pricedCurrency,
  pricedAmount,
  enabled = true,
}: Params) => {
  const chainId = useChainId();
  return useContractRead({
    ...useContractAddress("PaymentsModule"),
    abi: paymentsModuleABI,
    functionName: "calculatePaymentAmountByPriceType",
    args: [
      getTokenAddress(chainId, paymentToken),
      pricedAmount,
      getPaymentsPriceType(paymentToken, pricedCurrency),
      getCurrencyAddress(chainId, pricedCurrency),
    ],
    enabled,
  });
};

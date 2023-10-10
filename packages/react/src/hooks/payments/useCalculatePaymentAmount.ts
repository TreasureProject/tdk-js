import type { PaymentsToken } from "@treasure/core";
import {
  getPaymentsPriceType,
  getPaymentsTokenAddress,
  paymentsModuleABI,
} from "@treasure/core";
import { useChainId, useContractRead } from "wagmi";

import { useTreasureContractAddress } from "../useTreasureContractAddress";

type Params = {
  paymentToken: PaymentsToken;
  pricedToken: PaymentsToken | "USD";
  pricedAmount: bigint;
  enabled?: boolean;
};

export const useCalculatePaymentAmount = ({
  paymentToken,
  pricedToken,
  pricedAmount,
  enabled = true,
}: Params) => {
  const chainId = useChainId();
  return useContractRead({
    ...useTreasureContractAddress("PaymentsModule"),
    abi: paymentsModuleABI,
    functionName: "calculatePaymentAmountByPriceType",
    args: [
      getPaymentsTokenAddress(chainId, paymentToken),
      pricedAmount,
      getPaymentsPriceType(paymentToken, pricedToken),
      getPaymentsTokenAddress(chainId, pricedToken),
    ],
    enabled,
  });
};

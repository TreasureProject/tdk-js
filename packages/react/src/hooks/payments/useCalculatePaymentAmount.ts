import {
  PaymentsCalculatePaymentAmountParams,
  getPaymentsCalculatePaymentAmountArgs,
  paymentsModuleABI,
} from "@treasure/core";
import { useChainId, useContractRead } from "wagmi";

import { useTreasureContractAddress } from "../useTreasureContractAddress";

export const useCalculatePaymentAmount = (
  params: PaymentsCalculatePaymentAmountParams,
) =>
  useContractRead({
    ...useTreasureContractAddress({ contract: "PaymentsModule" }),
    abi: paymentsModuleABI,
    functionName: "calculatePaymentAmountByPriceType",
    args: getPaymentsCalculatePaymentAmountArgs(useChainId(), params),
  });

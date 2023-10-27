import { CheckoutWithCard } from "@paperxyz/react-client-sdk";
import type {
  AddressString,
  Currency,
  OnSuccessFn,
  Token,
} from "@treasure/core";
import { formatUSD, sumArray } from "@treasure/core";
import { useCallback, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatEther, parseUnits } from "viem";
import { useAccount } from "wagmi";

import {
  useBlockExplorer,
  useCalculatePaymentAmount,
  useMakePayment,
  useTokenBalances,
  useTokenPrices,
} from "../hooks";
import { AmericanExpressIcon } from "../icons/AmericanExpressIcon";
import { ApplePayIcon } from "../icons/ApplePayIcon";
import { CloseIcon } from "../icons/CloseIcon";
import { ExternalLinkIcon } from "../icons/ExternalLinkIcon";
import { GooglePayIcon } from "../icons/GooglePayIcon";
import { MastercardIcon } from "../icons/MastercardIcon";
import { TrashIcon } from "../icons/TrashIcon";
import { TreasureLogoFull } from "../icons/TreasureLogoFull";
import { VisaIcon } from "../icons/VisaIcon";
import { cn } from "../utils";
import { Button } from "./ui/Button";
import { CurrencyAmount } from "./ui/CurrencyAmount";
import { CurrencyIcon } from "./ui/CurrencyIcon";
import { Dialog, DialogContent } from "./ui/Dialog";
import { RadioButtonIcon } from "./ui/RadioButtonIcon";

type Item = {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  imageUrl?: string;
  pricePerItem: number;
  priceCurrency: Currency;
  quantity?: number;
  data?: unknown;
};

type ContentProps = {
  items: Item[];
  paymentCurrencies: Currency[];
  paymentRecipient: AddressString;
  enabled?: boolean;
  className?: string;
  onClose: () => void;
};

type Props = ContentProps & {
  open: boolean;
};

type State =
  | { status: "IDLE" }
  | { status: "CHECKOUT" }
  | { status: "CHECKOUT_WITH_CARD" }
  | { status: "SUCCESS"; txHash: string | undefined };

type Action =
  | { type: "RESET" }
  | { type: "CHECK_OUT" }
  | { type: "CHECK_OUT_WITH_CARD" }
  | { type: "SUCCESS"; txHash: string | undefined };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "RESET":
      return { status: "IDLE" };
    case "CHECK_OUT":
      return { status: "CHECKOUT" };
    case "CHECK_OUT_WITH_CARD":
      return { status: "CHECKOUT_WITH_CARD" };
    case "SUCCESS":
      return { status: "SUCCESS", txHash: action.txHash };
  }
};

const PaymentsCartModalContents = ({
  items,
  paymentCurrencies,
  paymentRecipient,
  enabled = true,
  className,
  onClose,
}: ContentProps) => {
  const { address } = useAccount();
  const blockExplorer = useBlockExplorer();
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, { status: "IDLE" });
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    paymentCurrencies[0],
  );

  const paymentTokens = paymentCurrencies.filter(
    (currency) => currency !== "USD",
  ) as Token[];
  const { data: tokenPrices } = useTokenPrices({
    tokens: paymentTokens,
    enabled,
  });
  const { data: tokenBalances } = useTokenBalances({ tokens: paymentTokens });
  const isSelectedUsd = selectedCurrency === "USD";

  const selectedTokenPrice = isSelectedUsd
    ? 1
    : tokenPrices[paymentTokens.indexOf(selectedCurrency)];
  const selectedTokenBalance = isSelectedUsd
    ? 0
    : tokenBalances[paymentTokens.indexOf(selectedCurrency)];
  const pricedCurrency = items[0]?.priceCurrency ?? "USD";
  const pricedAmount = sumArray(
    items.map(({ quantity, pricePerItem }) => (quantity ?? 1) * pricePerItem),
  );
  const pricedAmountBI = parseUnits(
    pricedAmount.toString(),
    pricedCurrency === "USD" ? 8 : 18, // TODO: don't assume 18 decimals
  );
  const totalItems = sumArray(items.map(({ quantity }) => quantity ?? 1));

  const { data: totalCost = 0n } = useCalculatePaymentAmount({
    paymentToken: selectedCurrency as Token,
    pricedCurrency,
    pricedAmount: pricedAmountBI,
    enabled: enabled && !isSelectedUsd,
  });

  const { isLoading, makePayment } = useMakePayment({
    paymentToken: selectedCurrency as Token,
    pricedCurrency,
    pricedAmount: pricedAmountBI,
    calculatedPaymentAmount: totalCost,
    recipient: paymentRecipient,
    enabled: enabled && !isSelectedUsd && selectedTokenBalance >= pricedAmount,
    onSuccess: useCallback<OnSuccessFn>((data) => {
      dispatch({ type: "SUCCESS", txHash: data?.transactionHash });
    }, []),
  });

  const renderTotalRow = () => (
    <div className="tdk-flex tdk-items-center tdk-justify-between tdk-gap-3 tdk-text-[#9EA3AA]">
      <p>{t("common.total")}</p>
      <div className="tdk-text-right">
        <CurrencyAmount
          className="tdk-text-white tdk-font-semibold tdk-justify-end"
          iconClassName="tdk-w-3.5 tdk-h-3.5"
          currency={selectedCurrency}
          amount={
            isSelectedUsd && pricedCurrency === "USD"
              ? pricedAmount
              : Number(formatEther(totalCost))
          }
        />
        {!isSelectedUsd ? (
          <p className="tdk-text-xs tdk-text-[#9EA3AA]">
            ~ {formatUSD(Number(formatEther(totalCost)) * selectedTokenPrice)}
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "tdk-space-y-6 md:tdk-space-y-8 tdk-rounded-2xl tdk-bg-[#0B1421] tdk-p-4 md:tdk-p-10 tdk-mx-auto",
        className,
      )}
    >
      <div className="tdk-flex tdk-items-center tdk-justify-between">
        <h1 className="tdk-text-2xl tdk-font-semibold tdk-text-white">
          {t("payments.cart.title", {
            context: state.status === "SUCCESS" ? "success" : "",
          })}
        </h1>
        <button
          className="tdk-flex tdk-h-10 tdk-w-10 tdk-items-center tdk-justify-center tdk-rounded-full tdk-border tdk-border-[#5E6470] tdk-text-[#5E6470] hover:tdk-border-night-200 hover:tdk-bg-night-200 hover:tdk-text-night-900 tdk-transition-colors"
          onClick={onClose}
        >
          <CloseIcon className="tdk-w-4 tdk-h-4" />
        </button>
      </div>
      <div className="tdk-grid tdk-grid-cols-1 md:tdk-grid-cols-2 tdk-gap-6 md:tdk-gap-10">
        <div className="tdk-flex tdk-flex-col tdk-justify-between tdk-gap-6 md:tdk-gap-8">
          <div className="tdk-space-y-3">
            <div className="tdk-space-y-4 md:tdk-space-y-8 tdk-rounded-xl tdk-border tdk-border-[#192B44] tdk-px-4 md:tdk-px-6 tdk-py-4 md:tdk-py-8">
              <div className="tdk-flex tdk-items-center tdk-justify-between tdk-gap-4 tdk-text-sm">
                <p className="tdk-text-night-600">
                  {t("common.items", { count: totalItems })}
                </p>
              </div>
              <ul className="tdk-space-y-4">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="tdk-flex tdk-items-center tdk-justify-between tdk-gap-8"
                  >
                    <div className="tdk-flex tdk-items-center tdk-gap-2 md:tdk-gap-3">
                      <div className="tdk-relative">
                        <div className="tdk-bg-night-400 tdk-h-16 tdk-w-16 tdk-rounded-lg tdk-overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" />
                          ) : null}
                        </div>
                        {item.quantity !== undefined ? (
                          <span className="tdk-text-night-100 tdk-absolute -tdk-right-1 -tdk-top-1 tdk-rounded-full tdk-bg-[#FF0026] tdk-px-2.5 tdk-text-xs tdk-font-semibold">
                            {item.quantity}
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <span className="tdk-block tdk-font-medium tdk-text-white">
                          {item.title}
                        </span>
                        {item.subtitle ? (
                          <span className="tdk-text-night-600 tdk-block tdk-text-sm">
                            {item.subtitle}
                          </span>
                        ) : null}
                        <CurrencyAmount
                          className="md:tdk-hidden"
                          currency={item.priceCurrency}
                          amount={item.pricePerItem}
                        />
                      </div>
                    </div>
                    <div className="tdk-flex tdk-items-center tdk-gap-6">
                      <CurrencyAmount
                        className="tdk-hidden md:tdk-block"
                        currency={item.priceCurrency}
                        amount={item.pricePerItem}
                      />
                      {state.status === "IDLE" ? (
                        <button
                          className="tdk-group tdk-flex tdk-h-9 tdk-w-9 tdk-items-center tdk-justify-center tdk-rounded-md tdk-border tdk-border-[#5E6470] hover:tdk-border-night-200 tdk-transition-colors"
                          title={t("common.removeItem")}
                        >
                          <TrashIcon className="tdk-w-4 tdk-h-4 tdk-text-night-500 group-hover:tdk-text-night-200 tdk-transition-colors" />
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
              {state.status === "SUCCESS" && state.txHash ? (
                <a
                  className="tdk-w-full tdk-flex tdk-items-center tdk-justify-center tdk-gap-1 tdk-border tdk-border-[#192B44] tdk-p-3 tdk-rounded-md tdk-text-[#0093D5] tdk-text-sm tdk-font-semibold hover:tdk-text-night-200 tdk-transition-colors"
                  href={`${blockExplorer.url}/tx/${state.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on {blockExplorer.name}
                  <ExternalLinkIcon className="tdk-w-3 tdk-h-3" />
                </a>
              ) : undefined}
            </div>
          </div>
          <div className="tdk-space-y-3 tdk-text-xs tdk-text-[#A4A9AF] tdk-hidden md:tdk-block">
            <p>{t("payments.cart.terms")}</p>
            <p>{t("payments.cart.termsCopy")}</p>
            <TreasureLogoFull className="tdk-text-white tdk-h-10" />
          </div>
        </div>
        {state.status === "SUCCESS" ? (
          <div className="space-y-8 text-center">
            <img
              className="tdk-max-w-[60%] tdk-mx-auto"
              src="https://images.treasure.lol/tdk/payments/meem.png"
              alt="The Wandering Merchant"
            />
            <div className="tdk-space-y-5">
              <h2 className="tdk-text-xl tdk-text-white tdk-font-semibold">
                {t("payments.cart.successMessageTitle")}
              </h2>
              <p className="tdk-text-xs tdk-text-night-200">
                {t("payments.cart.successMessageDescription")}
              </p>
              <Button onClick={onClose}>{t("common.close")}</Button>
            </div>
          </div>
        ) : state.status === "CHECKOUT_WITH_CARD" ? (
          <div className="tdk-rounded-xl tdk-border tdk-border-[#192B44] tdk-text-sm tdk-space-y-2 p-4">
            <div>
              <CheckoutWithCard
                configs={{
                  contractId: "6029d167-4ae5-42f7-b204-f355ad9246ff",
                  walletAddress: address ?? "",
                  mintMethod: {
                    name: "mint",
                    args: {
                      _id: "76",
                      _amount: "$QUANTITY",
                      _account: "$WALLET",
                    },
                    payment: {
                      value: "0.00001 * $QUANTITY",
                      currency: "AGOR",
                    },
                  },
                }}
                options={{
                  colorPrimary: "#DC2626",
                  colorText: "#E7E8E9",
                  inputBorderColor: "#9FA3A9",
                }}
                onPaymentSuccess={() => {
                  dispatch({ type: "SUCCESS", txHash: undefined });
                }}
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: "RESET" })}
            >
              {t("common.goBack")}
            </Button>
          </div>
        ) : state.status === "CHECKOUT" ? (
          <div className="tdk-space-y-3">
            <div className="tdk-rounded-xl tdk-border tdk-border-[#192B44] tdk-p-4 tdk-flex tdk-items-center tdk-justify-between tdk-gap-6">
              <div className="tdk-flex tdk-items-center tdk-gap-3">
                <div className="tdk-rounded-md tdk-border tdk-border-[#192B44] tdk-p-2.5">
                  <CurrencyIcon
                    currency={selectedCurrency}
                    className="tdk-h-6 tdk-w-6"
                  />
                </div>
                <div className="tdk-text-left">
                  <span className="tdk-block tdk-text-base tdk-font-semibold tdk-text-white group-hover:tdk-underline">
                    {selectedCurrency}
                  </span>
                  <span className="tdk-block tdk-text-xs tdk-text-[#9EA3AA]">
                    ~ {formatUSD(selectedTokenPrice)}
                  </span>
                </div>
              </div>
              <div className="tdk-text-right">
                <CurrencyAmount
                  className="tdk-text-base tdk-text-white"
                  currency={selectedCurrency}
                  amount={selectedTokenBalance}
                />
                <span className="tdk-block tdk-text-xs tdk-text-[#9EA3AA]">
                  Your balance
                </span>
              </div>
            </div>
            <div className="tdk-rounded-xl tdk-border tdk-border-[#192B44] tdk-p-4 tdk-text-sm tdk-space-y-6">
              {renderTotalRow()}
              <div className="tdk-space-y-3">
                <Button
                  onClick={makePayment}
                  disabled={isLoading || !makePayment}
                >
                  {t("payments.cart.submit")}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => dispatch({ type: "RESET" })}
                >
                  {t("common.goBack")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="tdk-rounded-xl tdk-border tdk-border-[#192B44]">
            <div className="tdk-flex tdk-items-center tdk-justify-between tdk-gap-4 tdk-p-4 md:tdk-p-6 tdk-text-sm">
              <p className="tdk-text-night-600">
                {t("payments.cart.optionsTitle")}
              </p>
              <button className="tdk-text-[#0093D5]">
                {t("common.moreInfo")}
              </button>
            </div>
            <ul>
              {paymentTokens.map((token, i) => (
                <li key={token}>
                  <button
                    className={cn(
                      "tdk-group tdk-flex tdk-w-full tdk-items-center tdk-justify-between tdk-gap-6 md:tdk-gap-8 tdk-p-3 md:tdk-p-4 tdk-transition-colors",
                      token === selectedCurrency && "tdk-bg-[#101D2F]",
                    )}
                    onClick={() => setSelectedCurrency(token)}
                  >
                    <div className="tdk-flex tdk-items-center tdk-gap-3 md:tdk-gap-4">
                      <RadioButtonIcon selected={token === selectedCurrency} />
                      <div className="tdk-text-left">
                        <span className="tdk-block tdk-text-base tdk-font-semibold tdk-text-white group-hover:tdk-underline">
                          {token}
                        </span>
                        <span className="tdk-block tdk-text-xs tdk-text-[#9EA3AA]">
                          ~ {formatUSD(tokenPrices[i])}
                        </span>
                      </div>
                    </div>
                    <div className="tdk-flex tdk-items-center tdk-gap-3 md:tdk-gap-8">
                      {tokenBalances[paymentTokens.indexOf(token)] ? (
                        <CurrencyAmount
                          currency={token}
                          amount={tokenBalances[paymentTokens.indexOf(token)]}
                        />
                      ) : null}
                      <div className="tdk-rounded-md tdk-border tdk-border-[#192B44] tdk-p-2.5">
                        <CurrencyIcon
                          currency={token}
                          className="tdk-h-6 tdk-w-6"
                        />
                      </div>
                    </div>
                  </button>
                </li>
              ))}
              {paymentCurrencies.includes("USD") ? (
                <li>
                  <button
                    className={cn(
                      "tdk-group tdk-flex tdk-w-full tdk-items-center tdk-gap-3 md:tdk-gap-4 tdk-p-3 md:tdk-px-4 md:tdk-py-6 tdk-transition-colors",
                      isSelectedUsd && "tdk-bg-[#101D2F]",
                    )}
                    onClick={() => setSelectedCurrency("USD")}
                  >
                    <RadioButtonIcon selected={isSelectedUsd} />
                    <div className="tdk-flex-1 tdk-text-left tdk-flex tdk-items-center tdk-gap-2 tdk-justify-between">
                      <span className="tdk-shrink-0 tdk-block tdk-text-base tdk-font-semibold tdk-text-white group-hover:tdk-underline">
                        Pay with
                      </span>
                      <div className="tdk-flex-1 tdk-flex tdk-items-center tdk-justify-end tdk-gap-1 tdk-flex-wrap">
                        <ApplePayIcon className="tdk-h-5 tdk-bg-white tdk-rounded-md" />
                        <GooglePayIcon className="tdk-h-5 tdk-bg-white tdk-rounded-md" />
                        <VisaIcon className="tdk-h-5 tdk-border tdk-border-[#192B44] tdk-rounded-md" />
                        <MastercardIcon className="tdk-h-5 tdk-border tdk-border-[#192B44] tdk-rounded-md" />
                        <AmericanExpressIcon className="tdk-h-5" />
                      </div>
                    </div>
                  </button>
                </li>
              ) : null}
            </ul>
            <div className="tdk-space-y-4 md:tdk-space-y-6 tdk-border-t tdk-border-[#192B44] tdk-p-4 md:tdk-px-5 md:tdk-py-6 tdk-text-sm tdk-text-[#9EA3AA]">
              {renderTotalRow()}
              {/* <div className="tdk-flex tdk-items-center tdk-justify-between tdk-gap-3">
                <p>Fee</p>
                <p className="tdk-font-medium tdk-text-white">None</p>
              </div> */}
              <Button
                disabled={
                  isLoading ||
                  (selectedTokenBalance < pricedAmount && !isSelectedUsd)
                }
                onClick={() =>
                  dispatch({
                    type: isSelectedUsd ? "CHECK_OUT_WITH_CARD" : "CHECK_OUT",
                  })
                }
              >
                {isLoading
                  ? t("common.loading")
                  : selectedTokenBalance < pricedAmount && !isSelectedUsd
                  ? t("common.insufficientBalance")
                  : t("payments.cart.checkOut")}
              </Button>
            </div>
          </div>
        )}
        <div className="tdk-space-y-3 tdk-text-xs tdk-text-[#A4A9AF] md:tdk-hidden">
          <p>{t("payments.cart.terms")}</p>
          <p>{t("payments.cart.termsCopy")}</p>
          <TreasureLogoFull className="tdk-text-white tdk-h-8" />
        </div>
      </div>
    </div>
  );
};

export const PaymentsCartModal = ({
  open,
  className,
  ...contentProps
}: Props) => {
  return (
    <Dialog open={open}>
      <DialogContent>
        <PaymentsCartModalContents
          className={cn("tdk-max-w-5xl tdk-shadow-lg", className)}
          enabled={open}
          {...contentProps}
        />
      </DialogContent>
    </Dialog>
  );
};

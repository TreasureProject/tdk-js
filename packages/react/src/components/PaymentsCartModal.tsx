import type { Currency, Token } from "@treasure/core";
import { formatUSD } from "@treasure/core";
import { useState } from "react";

import { useTokenBalances, useTokenPrices } from "../hooks";
import { CloseIcon } from "../icons/CloseIcon";
import { TrashIcon } from "../icons/TrashIcon";
import { cn } from "../utils";
import { CurrencyAmount } from "./ui/CurrencyAmount";
import { CurrencyIcon } from "./ui/CurrencyIcon";
import { RadioButtonIcon } from "./ui/RadioButtonIcon";

type Item = {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  imageUrl?: string;
  quantity?: number;
  priceCurrency: Currency;
  pricePerItem: number;
  data?: unknown;
};

type Props = {
  items: Item[];
  paymentTokens: Token[];
};

export const PaymentsCartModal = ({ items, paymentTokens }: Props) => {
  const [selectedToken, setSelectedToken] = useState(paymentTokens[0]);
  const { data: tokenPrices } = useTokenPrices({
    tokens: paymentTokens,
  });
  const { data: tokenBalances } = useTokenBalances({ tokens: paymentTokens });

  const totalItemsPrice = items.reduce(
    (acc, { pricePerItem, quantity }) =>
      acc + (quantity === undefined ? 1 : quantity) * pricePerItem,
    0,
  );
  const selectedOptionPrice = tokenPrices[paymentTokens.indexOf(selectedToken)];

  return (
    <div className="tdk-space-y-8 tdk-rounded-2xl tdk-bg-[#0B1421] tdk-p-10">
      <div className="tdk-flex tdk-items-start tdk-justify-between">
        <h1 className="tdk-text-2xl tdk-font-semibold tdk-text-white">
          Checkout Overview
        </h1>
        <button className="tdk-flex tdk-h-10 tdk-w-10 tdk-items-center tdk-justify-center tdk-rounded-full tdk-border tdk-border-[#5E6470] tdk-text-[#5E6470] hover:tdk-border-night-200 hover:tdk-bg-night-200 hover:tdk-text-night-900 tdk-transition-colors">
          <CloseIcon className="tdk-w-4 tdk-h-4" />
        </button>
      </div>
      <div className="tdk-grid tdk-grid-cols-2 tdk-gap-8">
        <div className="tdk-flex tdk-flex-col tdk-justify-between tdk-gap-8">
          <div className="tdk-space-y-3">
            <div className="tdk-space-y-8 tdk-rounded-xl tdk-border tdk-border-[#192B44] tdk-px-6 tdk-py-8">
              <div className="tdk-flex tdk-items-center tdk-justify-between tdk-gap-4 tdk-text-sm">
                <p className="tdk-text-night-600">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </p>
                <button className="tdk-text-[#0093D5]">Clear cart</button>
              </div>
              <ul>
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="tdk-flex tdk-items-center tdk-justify-between tdk-gap-8"
                  >
                    <div className="tdk-flex tdk-items-center tdk-gap-3">
                      <div className="tdk-relative">
                        <div className="tdk-bg-night-400 tdk-h-16 tdk-w-16 tdk-rounded-lg" />
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
                      </div>
                    </div>
                    <div className="tdk-flex tdk-items-center tdk-gap-6">
                      <CurrencyAmount
                        currency={item.priceCurrency}
                        amount={item.pricePerItem}
                      />
                      <button className="tdk-group tdk-flex tdk-h-9 tdk-w-9 tdk-items-center tdk-justify-center tdk-rounded-md tdk-border tdk-border-[#5E6470] hover:tdk-border-night-200 tdk-transition-colors">
                        <TrashIcon className="tdk-w-4 tdk-h-4 tdk-text-night-500 group-hover:tdk-text-night-200 tdk-transition-colors" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="tdk-space-y-3 tdk-text-xs tdk-text-[#A4A9AF]">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam
            </p>
            <p>&copy; 2021-2023 Treasure. All Rights Reserved.</p>
          </div>
        </div>
        <div className="tdk-rounded-xl tdk-border tdk-border-[#192B44]">
          <div className="tdk-flex tdk-items-center tdk-justify-between tdk-gap-4 tdk-p-6 tdk-text-sm">
            <p className="tdk-text-night-600">Check out using</p>
            <button className="tdk-text-[#0093D5]">More info</button>
          </div>
          <ul>
            {paymentTokens.map((token, i) => (
              <li key={token}>
                <button
                  className={cn(
                    "tdk-group tdk-flex tdk-w-full tdk-items-center tdk-justify-between tdk-gap-8 tdk-p-4 tdk-transition-colors",
                    token === selectedToken && "tdk-bg-[#101D2F]",
                  )}
                  onClick={() => setSelectedToken(token)}
                >
                  <div className="flex items-center gap-4">
                    <RadioButtonIcon selected={token === selectedToken} />
                    <div className="tdk-text-left">
                      <span className="tdk-block tdk-text-base tdk-font-semibold tdk-text-white group-hover:tdk-underline">
                        {token}
                      </span>
                      <span className="tdk-block tdk-text-xs tdk-text-[#9EA3AA]">
                        ~ {formatUSD(tokenPrices[i])}
                      </span>
                    </div>
                  </div>
                  <div className="tdk-flex tdk-items-center tdk-gap-8">
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
          </ul>
          <div className="tdk-space-y-6 tdk-border-t tdk-border-[#192B44] tdk-px-5 tdk-py-6 tdk-text-sm tdk-text-[#9EA3AA]">
            <div className="tdk-flex tdk-items-center tdk-justify-between tdk-gap-3">
              <p>Total</p>
              <div className="tdk-text-right">
                <CurrencyAmount
                  className="tdk-text-white tdk-font-semibold"
                  iconClassName="tdk-w-3.5 tdk-h-3.5"
                  currency={selectedToken}
                  amount={totalItemsPrice * selectedOptionPrice}
                />
                {/* TODO: Don't assume that items are priced in USD */}
                <p className="tdk-text-xs tdk-text-[#9EA3AA]">
                  ~ {formatUSD(totalItemsPrice)}
                </p>
              </div>
            </div>
            {/* <div className="tdk-flex tdk-items-center tdk-justify-between tdk-gap-3">
              <p>Fee</p>
              <p className="tdk-font-medium tdk-text-white">None</p>
            </div> */}
            <button className="tdk-border-ruby-900 focus:tdk-ring-ruby-500 tdk-bg-ruby-900 hover:tdk-bg-ruby-1000 tdk-w-full tdk-cursor-pointer tdk-rounded-lg tdk-border-2 tdk-px-5 tdk-py-2 tdk-font-semibold tdk-text-white tdk-shadow-sm tdk-transition-colors tdk-duration-500 hover:tdk-text-white focus:tdk-outline-none focus:tdk-ring-2 focus:tdk-ring-offset-2 disabled:tdk-cursor-not-allowed disabled:tdk-opacity-50">
              Check out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

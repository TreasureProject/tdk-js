import type { Currency } from "@treasure-dev/tdk-core";
import { formatAmount } from "@treasure-dev/tdk-core";

import { cn } from "../../utils/classnames";
import { CurrencyIcon } from "./CurrencyIcon";

type Props = {
  currency: Currency;
  amount: number;
  className?: string;
  iconClassName?: string;
};

export const CurrencyAmount = ({
  currency,
  amount,
  className,
  iconClassName,
}: Props) => (
  <div
    className={cn(
      "tdk-text-night-600 tdk-flex tdk-items-center tdk-gap-1.5 tdk-text-sm",
      className,
    )}
  >
    {currency === "USD" ? (
      `$${amount}`
    ) : (
      <>
        <CurrencyIcon
          currency={currency}
          className={cn("tdk-w-4 tdk-h-4", iconClassName)}
        />
        {formatAmount(amount)}
      </>
    )}
  </div>
);

import type { Currency } from "@treasure/core";

import { ArbitrumTokenIcon } from "../../icons/ArbitrumTokenIcon";
import { MagicTokenIcon } from "../../icons/MagicTokenIcon";
import { cn } from "../../utils";

type Props = {
  currency: Currency;
  className?: string;
};

export const CurrencyIcon = ({ currency, className }: Props) => {
  switch (currency) {
    case "MAGIC":
      return <MagicTokenIcon className={className} />;
    case "ARB":
      return (
        <ArbitrumTokenIcon className={cn("tdk-text-night-100", className)} />
      );
    default:
      return <div className={cn("tdk-bg-ruby-900", className)} />;
  }
};

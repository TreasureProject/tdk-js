import Decimal from "decimal.js-light";

export const formatAmount = (value: string | number, toLocale = true) => {
  const decimal = new Decimal(value);
  let decimalPlaces: number;
  if (decimal.lt(1e-3)) {
    decimalPlaces = 6;
  } else if (decimal.lt(1)) {
    decimalPlaces = 4;
  } else if (decimal.lt(100)) {
    decimalPlaces = 3;
  } else {
    decimalPlaces = 2;
  }

  const rounded = decimal.toDecimalPlaces(decimalPlaces, Decimal.ROUND_DOWN);

  if (toLocale) {
    return rounded
      .toNumber()
      .toLocaleString("en-US", { maximumFractionDigits: decimalPlaces });
  }

  return rounded.toString();
};

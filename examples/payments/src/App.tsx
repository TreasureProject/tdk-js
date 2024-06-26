import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { Currency, Token } from "@treasure-dev/tdk-react";
import {
  PaymentsCartModal,
  sumArray,
  useCalculatePaymentAmount,
  useMakePayment,
} from "@treasure-dev/tdk-react";
import { useState } from "react";
import { formatEther, parseUnits } from "viem";
import { useAccount } from "wagmi";

const RECIPIENT_ADDRESS = "0x3f466d0d3f7283c25c5071c2930338b9c6bf3cd3";

const PRODUCTS = {
  "92": {
    name: "Gold Coin",
    image:
      "https://djmahssgw62sw.cloudfront.net/general/0x7cfa22d352d3737d1a3695381b62d850a8ff1705f47908298dcb7b91426576b1.jpg",
    tier: 5,
    usdPrice: 5,
  },
  "76": {
    name: "Donkey",
    image:
      "https://djmahssgw62sw.cloudfront.net/general/0x1cbfc8194070b34e668a5310d6603422177e68534b0ff7794a931f2e5ce989a4.jpg",
    tier: 4,
    usdPrice: 15,
  },
  "100": {
    name: "Jar of Fairies",
    image:
      "https://djmahssgw62sw.cloudfront.net/general/0x17d36e8f29ada5e13a57cabd6fe30668e4c87a2bfd6ef3bd57fa460c377eebbf.jpg",
    tier: 3,
    usdPrice: 30,
  },
  "104": {
    name: "Military Stipend",
    image:
      "https://djmahssgw62sw.cloudfront.net/general/0xfc4bb4ca2c20a20287a0ba9a9ad44e19e22d24eba211c55238aa40035b40f387.jpg",
    tier: 2,
    usdPrice: 90,
  },
  "95": {
    name: "Grin",
    image:
      "https://djmahssgw62sw.cloudfront.net/general/0xdbefba2bb67236dd2700bf9c2eb2d7e1b0a6401b50ecb18efc8597edf329ad46.jpg",
    tier: 1,
    usdPrice: 2000,
  },
} as const;

export const App = () => {
  const { isConnected } = useAccount();
  const [{ paymentToken, pricedCurrency, pricedAmount }, setState] = useState<{
    paymentToken: Token;
    pricedCurrency: Currency;
    pricedAmount: number;
  }>({
    paymentToken: "MAGIC",
    pricedCurrency: "USD",
    pricedAmount: 10,
  });
  const [selectedProducts, setSelectedProducts] = useState<
    Record<string, number>
  >({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const numSelectedProducts = sumArray(Object.values(selectedProducts));

  const pricedAmountBI = parseUnits(
    pricedAmount.toString(),
    pricedCurrency === "USD" ? 8 : 18,
  );

  const { data: paymentAmount = 0n } = useCalculatePaymentAmount({
    paymentToken,
    pricedCurrency,
    pricedAmount: pricedAmountBI,
  });

  const { isApproved, isLoading, makePayment } = useMakePayment({
    paymentToken,
    pricedCurrency,
    pricedAmount: pricedAmountBI,
    calculatedPaymentAmount: paymentAmount,
    recipient: RECIPIENT_ADDRESS,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <h1 className="font-semibold text-2xl text-ruby-900">
          Payments Examples
        </h1>
        <ConnectButton />
      </header>
      <main>
        {!isConnected ? (
          <p className="rounded-lg border-2 border-honey-200 bg-honey-50 p-4 text-center font-medium text-lg">
            Connect your wallet to continue.
          </p>
        ) : (
          <>
            <h2 className="mb-2 font-medium text-ruby-900 text-xl">
              Payments Module Demo
            </h2>
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
              <div className="space-y-4 rounded-lg bg-night-900 p-4 text-night-300">
                <h2 className="font-semibold text-honey-200 text-xl">
                  Parameters
                </h2>
                <div>
                  <label className="block font-medium">Priced Token</label>
                  <select
                    className="rounded px-2.5 py-1.5 text-slate-600"
                    value={pricedCurrency}
                    onChange={(e) =>
                      setState((curr) => ({
                        ...curr,
                        pricedCurrency: e.target.value as Currency,
                      }))
                    }
                  >
                    <option>USD</option>
                    <option>MAGIC</option>
                    <option>ARB</option>
                    <option value="GAS">Gas Token</option>
                    {/* <option>ERC20 Address</option> */}
                  </select>
                </div>
                <div>
                  <label className="block font-medium">Priced Amount</label>
                  <input
                    className="rounded px-2.5 py-1.5 text-slate-600"
                    type="number"
                    value={pricedAmount}
                    onChange={(e) =>
                      setState((curr) => ({
                        ...curr,
                        pricedAmount: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block font-medium">Payment Token</label>
                  <select
                    className="rounded px-2.5 py-1.5 text-slate-600"
                    value={paymentToken}
                    onChange={(e) =>
                      setState((curr) => ({
                        ...curr,
                        paymentToken: e.target.value as Token,
                      }))
                    }
                  >
                    <option>MAGIC</option>
                    <option>ARB</option>
                    <option value="GAS">Gas Token</option>
                    {/* <option>ERC20 Address</option> */}
                  </select>
                </div>
              </div>
              <div className="space-y-3 rounded-lg border-2 border-honey-200 bg-honey-50 p-4">
                <p>
                  <span className="font-medium">Cost:</span> {pricedAmount}{" "}
                  {pricedCurrency}
                </p>
                <p>
                  <span className="font-medium">Payment:</span>{" "}
                  {formatEther(paymentAmount)} {paymentToken}
                </p>
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border-2 border-ruby-900 bg-ruby-900 px-5 py-2 font-bold text-white text-xs shadow-sm transition-colors duration-500 disabled:cursor-not-allowed hover:bg-ruby-1000 hover:text-white sm:text-base disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ruby-500 focus:ring-offset-2"
                  disabled={isLoading || !makePayment}
                  onClick={makePayment}
                >
                  {isLoading
                    ? "Loading..."
                    : isApproved
                      ? "Make Payment"
                      : "Approve & Make Payment"}
                </button>
              </div>
            </div>
            <h2 className="mt-6 mb-1 font-medium text-ruby-900 text-xl">
              Payments Checkout Modal Demo
            </h2>
            <p className="mb-1">Select items for purchase:</p>
            <div className="grid grid-cols-5 items-start gap-4">
              {Object.entries(PRODUCTS)
                .sort((a, b) => b[1].tier - a[1].tier)
                .map(([id, { name, image, usdPrice }]) => (
                  <div
                    key={id}
                    className="space-y-1 rounded-md bg-honey-400 p-2 pb-1 text-left"
                  >
                    <img src={image} alt="" className="rounded-md" />
                    <div className="flex items-start justify-between gap-2">
                      <span>{name}</span>
                      <span>${usdPrice}</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-md bg-ruby-800 text-center text-honey-50">
                      <button
                        type="button"
                        className="px-4 font-bold text-lg"
                        onClick={() =>
                          setSelectedProducts((curr) => ({
                            ...curr,
                            [id]: Math.max((curr[id] || 0) - 1, 0),
                          }))
                        }
                      >
                        -
                      </button>
                      <span className="flex-1">
                        {selectedProducts[id] || 0}
                      </span>
                      <button
                        type="button"
                        className="px-4 font-bold text-lg"
                        onClick={() =>
                          setSelectedProducts((curr) => ({
                            ...curr,
                            [id]: (curr[id] || 0) + 1,
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            <button
              type="button"
              className="mt-3 cursor-pointer rounded-lg border-2 border-ruby-900 bg-ruby-900 px-5 py-2 font-bold text-white text-xs shadow-sm transition-colors duration-500 disabled:cursor-not-allowed hover:bg-ruby-1000 hover:text-white sm:text-base disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ruby-500 focus:ring-offset-2"
              disabled={numSelectedProducts === 0}
              onClick={() => setIsCheckingOut(true)}
            >
              {numSelectedProducts
                ? `Buy ${numSelectedProducts} ${
                    numSelectedProducts === 1 ? "Treasure" : "Treasures"
                  }`
                : "Select Treasures"}
            </button>
            <PaymentsCartModal
              open={isCheckingOut}
              onClose={() => setIsCheckingOut(false)}
              items={Object.entries(selectedProducts)
                .filter(([, quantity]) => quantity > 0)
                .map(([id, quantity]) => {
                  const product = PRODUCTS[id as keyof typeof PRODUCTS];
                  return {
                    id,
                    title: product.name,
                    subtitle: `Treasures | Tier ${product.tier}`,
                    imageUrl: product.image,
                    quantity,
                    priceCurrency: "USD",
                    pricePerItem: product.usdPrice,
                  };
                })}
              paymentTokens={["MAGIC", "ARB"]}
              paymentRecipient={RECIPIENT_ADDRESS}
            />
          </>
        )}
      </main>
    </div>
  );
};

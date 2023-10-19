import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { PaymentsToken } from "@treasure/react";
import { useCalculatePaymentAmount, useMakePayment } from "@treasure/react";
import { useState } from "react";
import { formatEther, parseUnits } from "viem";
import { useAccount, useNetwork } from "wagmi";

const RECIPIENT_ADDRESS = "0x3f466d0d3f7283c25c5071c2930338b9c6bf3cd3";

export const App = () => {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const [{ paymentToken, pricedToken, pricedAmount }, setState] = useState<{
    paymentToken: PaymentsToken;
    pricedToken: PaymentsToken | "USD";
    pricedAmount: number;
  }>({
    paymentToken: "MAGIC",
    pricedToken: "USD",
    pricedAmount: 10,
  });

  const pricedAmountBI = parseUnits(
    pricedAmount.toString(),
    pricedToken === "USD" ? 8 : 18,
  );

  const { data: paymentAmount = 0n } = useCalculatePaymentAmount({
    paymentToken,
    pricedToken,
    pricedAmount: pricedAmountBI,
  });

  const { isApproved, isLoading, makePayment } = useMakePayment({
    paymentToken,
    pricedToken,
    pricedAmount: pricedAmountBI,
    calculatedPaymentAmount: paymentAmount,
    recipient: RECIPIENT_ADDRESS,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <h1 className="text-ruby-900 text-2xl font-semibold">
          Payments Module Demo
        </h1>
        <ConnectButton />
      </header>
      <main>
        {!isConnected ? (
          <p className="border-honey-200 bg-honey-50 rounded-lg border-2 p-4 text-center text-lg font-medium">
            Connect your wallet to continue.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-night-900 text-night-300 space-y-4 rounded-lg p-4">
              <h2 className="text-honey-200 text-xl font-semibold">
                Parameters
              </h2>
              <div>
                <label className="block font-medium">Priced Token</label>
                <select
                  className="rounded px-2.5 py-1.5 text-slate-600"
                  value={pricedToken}
                  onChange={(e) =>
                    setState((curr) => ({
                      ...curr,
                      pricedToken: e.target.value as PaymentsToken | "USD",
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
                      paymentToken: e.target.value as PaymentsToken,
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
            <div className="border-honey-200 bg-honey-50 space-y-3 rounded-lg border-2 p-4">
              <h2 className="text-ruby-900 text-xl font-semibold">
                Payment Widget
              </h2>
              <p>
                <span className="font-medium">Cost:</span> {pricedAmount}{" "}
                {pricedToken}
              </p>
              <p>
                <span className="font-medium">Payment:</span>{" "}
                {formatEther(paymentAmount)}{" "}
                {paymentToken === "GAS"
                  ? chain?.nativeCurrency.symbol ?? "ETH"
                  : paymentToken}
              </p>
              <button
                className="border-ruby-900 focus:ring-ruby-500 bg-ruby-900 hover:bg-ruby-1000 cursor-pointer rounded-lg border-2 px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors duration-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
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
        )}
      </main>
    </div>
  );
};

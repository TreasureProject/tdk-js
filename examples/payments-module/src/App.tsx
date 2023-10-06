import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  PaymentsToken,
  useCalculatePaymentAmount,
  useMakePayment,
} from "@treasure/react";
import { useState } from "react";
import { formatEther, parseUnits } from "viem";
import { useAccount } from "wagmi";

import { usePaymentsReceiver } from "./hooks/usePaymentsReceiver";

export const App = () => {
  const { isConnected } = useAccount();
  const [{ paymentToken, pricedToken, pricedAmount }, setState] = useState<{
    paymentToken: PaymentsToken;
    pricedToken: PaymentsToken | "USD";
    pricedAmount: number;
  }>({
    paymentToken: "MAGIC",
    pricedToken: "USD",
    pricedAmount: 10,
  });
  const { address: recipient } = usePaymentsReceiver();

  const pricedAmountBI = parseUnits(
    pricedAmount.toString(),
    pricedToken === "USD" ? 8 : 18,
  );

  const { data: paymentAmount = 0n } = useCalculatePaymentAmount({
    paymentToken,
    pricedToken,
    pricedAmount: pricedAmountBI,
  });

  const { makePayment } = useMakePayment({
    paymentToken,
    pricedToken,
    pricedAmount: pricedAmountBI,
    calculatedPaymentAmount: paymentAmount,
    recipient,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8 text-slate-50">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Payments Module Demo</h1>
        <ConnectButton />
      </header>
      <main>
        {!isConnected ? (
          <p className="text-center">Connect your wallet to continue.</p>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-3 items-start gap-6">
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
            </div>
            <div className="space-y-3 rounded-lg bg-slate-400 p-4 text-slate-700">
              <p>
                <span className="font-medium">Estimated payment:</span>{" "}
                {formatEther(paymentAmount)} {paymentToken}
              </p>
              <button
                className="rounded border border-slate-800 bg-slate-700 px-2 py-1.5 text-slate-300"
                onClick={makePayment}
              >
                Make Payment
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

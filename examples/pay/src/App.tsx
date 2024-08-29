import { openHallidayOnrampToEOA } from "@halliday-sdk/commerce";
import { Button } from "@treasure-dev/tdk-react";

export const App = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-semibold text-2xl text-ruby">
          TDK React - Halliday Pay Example
        </h1>
      </header>
      <main className="space-y-6">
        <Button
          onClick={() => {
            openHallidayOnrampToEOA({
              apiKey: import.meta.env.VITE_HALLIDAY_API_KEY,
              destinationBlockchainType: "AVALANCHE_FUJI",
              destinationCryptoType: "TRADERJOE_USDC_AVALANCHE_FUJI",
              useSandbox: true,
            });
          }}
        >
          Onramp with Halliday
        </Button>
      </main>
    </div>
  );
};

import { createThirdwebClient } from "thirdweb";
import { arbitrum } from "thirdweb/chains";
import { getBuyWithFiatQuote, isSwapRequiredPostOnramp } from "thirdweb/pay";
import {
  ConnectButton,
  PayEmbed,
  ThirdwebProvider,
  useActiveAccount,
  useSendTransaction,
} from "thirdweb/react";

export const App = () => {
  const client = createThirdwebClient({
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
  });
  const MAGIC_ADDRESS = "0x539bdE0d7Dbd336b79148AA742883198BBF60342";
  const account = useActiveAccount();
  const { mutate: sendTransaction2 } = useSendTransaction();
  const handleSendTransaction = () => {
    sendTransaction2({
      to: MAGIC_ADDRESS,
      value: BigInt("100000000000000000"), // 0.1 ETH in wei
      data: "0x", // Optional data to send
      chain: arbitrum,
      client: client, // thirdweb client
    });
  };

  // Get a quote for buying 0.1 Base ETH with USD
  async function fetchQuote() {
    if (!account) {
      return <div> Wallet not connected </div>;
    }
    const quote = await getBuyWithFiatQuote({
      client: client, // thirdweb client
      fromCurrencySymbol: "USD", // fiat currency symbol
      toChainId: arbitrum.id, // base chain id
      toAmount: "1.5",
      toTokenAddress: MAGIC_ADDRESS, //NATIVE_TOKEN_ADDRESS, // native token
      toAddress: account.address, // user's wallet address
      isTestMode: true,
    });

    // display quote information to user in the UI
    console.log("quote.fromCurrencyWithFees", quote.fromCurrencyWithFees);
    console.log(quote.processingFees);
    console.log(quote.onRampToken);
    console.log(quote.toToken);
    console.log(quote.estimatedDurationSeconds);
    console.log("onramp link", quote.onRampLink);

    const hasTwoSteps = isSwapRequiredPostOnramp(quote);

    if (hasTwoSteps) {
      console.log("has two steps");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-ruby-900 text-2xl font-semibold">
          Treasure Pay Example
        </h1>
      </header>
      <main className="space-y-6">
        <ConnectButton client={client} />

        <h2>~~~Fetch Quote~~~</h2>
        <button onClick={() => fetchQuote()}>Fetch quote</button>

        <h2>~~~sendTransaction 2~~~</h2>
        <ThirdwebProvider>
          <button onClick={() => handleSendTransaction()}>
            handleSendTransaction
          </button>
        </ThirdwebProvider>

        <h2>~~~Pay Embed~~~</h2>
        <PayEmbed
          client={client}
          theme="dark"
          supportedTokens={[]}
          payOptions={{
            prefillBuy: {
              amount: "10",
              token: {
                address: MAGIC_ADDRESS,
                name: "MAGIC",
                symbol: "MAGIC",
                icon: "...", // optional
              },
              chain: arbitrum,
              allowEdits: {
                amount: true, // allow editing buy amount
                token: false, // disable selecting buy token
                chain: false, // disable selecting buy chain
              },
            },
          }}
        />
      </main>
    </div>
  );
};

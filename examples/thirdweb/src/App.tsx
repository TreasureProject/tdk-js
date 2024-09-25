import {
  createThirdwebClient,
  defineChain,
  getContract,
  prepareContractCall,
  toWei,
} from "thirdweb";
import { ConnectButton, useSendAndConfirmTransaction } from "thirdweb/react";
import thirdwebIcon from "./thirdweb.svg";

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_TDK_CLIENT_ID,
});

const chain = defineChain(978657);

const wrappedMagicContract = getContract({
  client,
  chain,
  address: "0x280dcEd23Df559218B4767E7CBA8de166B3C68a6",
});

export function App() {
  const { mutateAsync: sendAndConfirmTransaction, isPending } =
    useSendAndConfirmTransaction();

  const handleWrap = async () => {
    const transaction = prepareContractCall({
      contract: wrappedMagicContract,
      method: "function deposit() payable",
      value: toWei("1"),
    });
    try {
      const result = await sendAndConfirmTransaction(transaction);
      console.log("Transaction complete:", result.transactionHash);
    } catch (err) {
      console.error("Error wrapping MAGIC:", err);
    }
  };

  return (
    <main className="container mx-auto flex min-h-[100vh] max-w-screen-lg items-center justify-center p-4 pb-10">
      <div className="space-y-10 py-20">
        <header className="flex flex-col items-center">
          <img
            src={thirdwebIcon}
            alt=""
            className="size-[150px] md:size-[150px]"
            style={{
              filter: "drop-shadow(0px 0px 24px #a726a9a8)",
            }}
          />
          <h1 className="mb-6 font-bold text-2xl text-zinc-100 tracking-tighter md:text-6xl">
            thirdweb SDK
            <span className="mx-1 inline-block text-zinc-300"> + </span>
            <span className="-skew-x-6 inline-block text-violet-500">
              {" "}
              vite{" "}
            </span>
          </h1>
        </header>
        <div className="flex justify-center">
          <ConnectButton
            client={client}
            appMetadata={{
              name: "Example app",
              url: "https://example.com",
            }}
            accountAbstraction={{
              chain: defineChain(978657),
              factoryAddress: "0x463effb51873c7720c810ac7fb2e145ec2f8cc60",
              sponsorGas: true,
            }}
          />
        </div>
        <div className="text-center">
          <button
            type="button"
            className="rounded bg-red-500 px-2 py-1 font-medium hover:bg-red-600 active:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
            disabled={isPending}
            onClick={handleWrap}
          >
            Wrap 1 MAGIC
          </button>
        </div>
      </div>
    </main>
  );
}

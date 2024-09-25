import { defineChain, getContract, prepareContractCall, toWei } from "thirdweb";
import { ConnectButton, useSendAndConfirmTransaction } from "thirdweb/react";
import { client } from "./client";
import thirdwebIcon from "./thirdweb.svg";

const chain = defineChain(978657);

const wrappedMagicContract = getContract({
  client,
  chain,
  address: "0x280dcEd23Df559218B4767E7CBA8de166B3C68a6",
});

export function App() {
  const {
    mutate: sendAndConfirmTransaction,
    data: result,
    error,
  } = useSendAndConfirmTransaction();

  const handleWrap = () => {
    const transaction = prepareContractCall({
      contract: wrappedMagicContract,
      method: "function deposit() payable",
      value: toWei("1"),
    });
    sendAndConfirmTransaction(transaction);
  };

  console.log({ result, error });

  return (
    <main className="container mx-auto flex min-h-[100vh] max-w-screen-lg items-center justify-center p-4 pb-10">
      <div className="py-20">
        <Header />
        <div className="mb-20 flex justify-center">
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
            className="rounded bg-red-500 px-2 py-1 font-medium hover:bg-red-600 active:bg-red-700"
            onClick={handleWrap}
          >
            Wrap 1 MAGIC
          </button>
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="mb-20 flex flex-col items-center md:mb-20">
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
        <span className="-skew-x-6 inline-block text-violet-500"> vite </span>
      </h1>

      <p className="text-base text-zinc-300">
        Read the{" "}
        <code className="mx-1 rounded bg-zinc-800 px-2 py-1 text-sm text-zinc-300">
          README.md
        </code>{" "}
        file to get started.
      </p>
    </header>
  );
}

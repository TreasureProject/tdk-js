import { Button, ConnectButton, useTreasure } from "@treasure-dev/tdk-react";
import { MagicSwapSection } from "./MagicSwapSection";
import { useApprove } from "./hooks/useApprove";
import { useSetApprovalForAll } from "./hooks/useSetApprovalForAll";

export const App = () => {
  const { user, contractAddresses } = useTreasure();
  const approveMagic = useApprove(
    contractAddresses.MAGIC,
    contractAddresses.MagicswapV2Router,
  );

  const approveTreasures = useSetApprovalForAll(
    contractAddresses.Treasures,
    contractAddresses.MagicswapV2Router,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-semibold text-2xl text-ruby-900">
          TDK Magicswap v2 Example
        </h1>
        <ConnectButton appName="Treasure" />
      </header>
      <main className="space-y-6">
        {user ? (
          <>
            <MagicSwapSection />
            <div className="space-y-1">
              <h1 className="font-medium text-xl">Test Transactions</h1>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => approveMagic(1000)}>
                  Approve 1000 MAGIC
                </Button>
                <Button onClick={() => approveTreasures()}>
                  Approve Treasures
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center">Connect with Treasure to continue</p>
        )}
      </main>
    </div>
  );
};

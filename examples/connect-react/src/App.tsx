import type { AddressString } from "@treasure-dev/tdk-core";
import { Button, ConnectButton, useTreasure } from "@treasure-dev/tdk-react";
import { toEther, toWei } from "thirdweb";

export const App = () => {
  const { tdk, user, contractAddresses } = useTreasure();

  const handleMintMagic = async (amount: number) => {
    if (!user?.address) {
      return;
    }

    try {
      await tdk.transaction.create(
        {
          address: contractAddresses.MAGIC,
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_to",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "_amount",
                  type: "uint256",
                },
              ],
              name: "mint",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ] as const,
          functionName: "mint",
          args: [user.address as AddressString, toWei(amount.toString())],
        },
        { includeAbi: true },
      );
    } catch (err) {
      console.error("Error minting MAGIC:", err);
    }
  };

  const handleSendEth = async (amount: number) => {
    if (!user?.address) {
      return;
    }

    try {
      await tdk.transaction.sendNative({
        to: "0xE647b2c46365741e85268ceD243113d08F7E00B8",
        amount: toWei(amount.toString()),
      });
    } catch (err) {
      console.error("Error sending ETH:", err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-semibold text-2xl text-ruby-900">
          TDK React - Connect Example
        </h1>
        <ConnectButton supportedChainIds={[421614, 42161]} />
      </header>
      <main className="space-y-6">
        {user ? (
          <>
            <div>
              <h1 className="font-medium text-xl">Active Sessions</h1>
              {user.allActiveSigners.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {user.allActiveSigners
                    .sort(
                      (a, b) => Number(b.endTimestamp) - Number(a.endTimestamp),
                    )
                    .map(
                      ({
                        signer,
                        isAdmin,
                        endTimestamp,
                        approvedTargets,
                        nativeTokenLimitPerTransaction,
                      }) => (
                        <li key={signer}>
                          <p className="font-medium">
                            {signer}{" "}
                            {isAdmin ? (
                              <span className="rounded bg-ruby-900 px-1 font-medium text-white text-xs uppercase">
                                Admin
                              </span>
                            ) : (
                              ""
                            )}
                          </p>
                          {!isAdmin ? (
                            <>
                              <p>
                                <span className="font-medium">Expires:</span>{" "}
                                {new Date(
                                  Number(endTimestamp) * 1000,
                                ).toLocaleString()}
                              </p>
                              <div>
                                <span className="font-medium">
                                  Approved targets:
                                </span>
                                <ul className="list-disc pl-6">
                                  {approvedTargets.map((target) => (
                                    <li key={target}>{target}</li>
                                  ))}
                                </ul>
                              </div>
                              <p>
                                <span className="font-medium">
                                  Native token limit per transaction:
                                </span>{" "}
                                {toEther(
                                  BigInt(nativeTokenLimitPerTransaction),
                                )}
                              </p>
                            </>
                          ) : null}
                        </li>
                      ),
                    )}
                </ul>
              ) : (
                <p>No active sessions</p>
              )}
            </div>
            <div className="space-y-1">
              <h1 className="font-medium text-xl">Test Transactions</h1>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleMintMagic(1000)}>
                  Mint 1,000 MAGIC
                </Button>
                <Button onClick={() => handleSendEth(0.0001)}>
                  Send 0.0001 ETH
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

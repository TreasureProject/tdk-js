import {
  type AddressString,
  Button,
  ConnectButton,
  getContractAddress,
  useTreasure,
} from "@treasure-dev/tdk-react";

export const App = () => {
  const { tdk, chainId, user } = useTreasure();
  const magicAddress = getContractAddress(chainId, "MAGIC");

  const handleMintMagic = async () => {
    if (!user?.smartAccountAddress) {
      return;
    }

    try {
      await tdk.transaction.create(
        {
          address: magicAddress,
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
          args: [
            user.smartAccountAddress as AddressString,
            1000000000000000000000n,
          ],
        },
        { includeAbi: true },
      );
    } catch (err) {
      console.error("Error minting MAGIC:", err);
    }
  };

  const handleSendEth = async () => {
    if (!user?.smartAccountAddress) {
      return;
    }

    try {
      await tdk.transaction.sendNative({
        to: "0x55d0cf68a1afe0932aff6f36c87efa703508191c",
        amount: 100000000000000n,
      });
    } catch (err) {
      console.error("Error sending ETH:", err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-ruby-900 text-2xl font-semibold">
          TDK Connect Example
        </h1>
        <ConnectButton appName="Treasure" />
      </header>
      <main className="space-y-6">
        {user ? (
          <>
            <div>
              <h1 className="text-xl font-medium">Active Sessions</h1>
              {user.allActiveSigners.length > 0 ? (
                <ul className="text-sm space-y-3">
                  {user.allActiveSigners
                    .sort(
                      (a, b) => Number(b.endTimestamp) - Number(a.endTimestamp),
                    )
                    .map(
                      ({ signer, isAdmin, endTimestamp, approvedTargets }) => (
                        <li key={signer}>
                          <p className="font-medium">
                            {signer}{" "}
                            {isAdmin ? (
                              <span className="font-medium uppercase bg-ruby-900 rounded text-white px-1 text-xs">
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
                                <ul className="pl-6 list-disc">
                                  {approvedTargets.map((target) => (
                                    <li key={target}>{target}</li>
                                  ))}
                                </ul>
                              </div>
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
              <h1 className="text-xl font-medium">Test Transactions</h1>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleMintMagic}>Mint 1,000 MAGIC</Button>
                <Button onClick={handleSendEth}>Send 0.0001 ETH</Button>
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

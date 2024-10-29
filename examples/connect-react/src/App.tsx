import { treasureTopaz } from "@treasure-dev/tdk-core";
import {
  type AddressString,
  Button,
  ConnectButton,
  useTreasure,
} from "@treasure-dev/tdk-react";
import { useCallback, useState } from "react";
import {
  encode,
  getContract,
  prepareContractCall,
  toEther,
  toWei,
} from "thirdweb";
import { arbitrumSepolia } from "thirdweb/chains";

const ERC20_MINTABLE_ABI = [
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
] as const;

const TOPAZ_NFT_API = [
  {
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const App = () => {
  const { client, chain, tdk, user, contractAddresses, trackCustomEvent } =
    useTreasure();

  const [tracking, setTracking] = useState(false);

  const handleMintMagic = async (amount: number) => {
    if (!user?.address) {
      return;
    }

    try {
      await tdk.transaction.create(
        {
          address: contractAddresses.MAGIC,
          abi: ERC20_MINTABLE_ABI,
          functionName: "mint",
          args: [user.address as AddressString, toWei(amount.toString())],
        },
        { includeAbi: true },
      );
    } catch (err) {
      console.error("Error minting MAGIC:", err);
    }
  };

  const handleRawMintMagic = async (amount: number) => {
    if (!user?.address) {
      return;
    }

    const contract = getContract({
      client,
      chain,
      address: contractAddresses.MAGIC,
      abi: ERC20_MINTABLE_ABI,
    });

    const transaction = prepareContractCall({
      contract,
      method: "mint",
      params: [user.address, toWei(amount.toString())],
    });

    try {
      const data = await encode(transaction);
      await tdk.transaction.sendRaw({
        to: contractAddresses.MAGIC,
        data,
      });
    } catch (err) {
      console.error("Error minting MAGIC with raw transaction:", err);
    }
  };

  const handleSendNative = async (amount: number) => {
    try {
      await tdk.transaction.sendRaw({
        to: "0xE647b2c46365741e85268ceD243113d08F7E00B8",
        value: toWei(amount.toString()),
        data: "0x",
      });
    } catch (err) {
      console.error("Error sending ETH:", err);
    }
  };

  const handleMintTopazNft = async () => {
    try {
      await tdk.transaction.create(
        {
          address: contractAddresses.TopazNFT,
          abi: TOPAZ_NFT_API,
          functionName: "mint",
          args: [],
        },
        { includeAbi: true },
      );
    } catch (err) {
      console.error("Error minting TOPAZ NFT:", err);
    }
  };

  const trackClick = useCallback(async () => {
    setTracking(true);
    try {
      const result = await trackCustomEvent({
        name: "test-click",
        properties: { test: "test-value" },
      });
      console.log(`Successfully tracked custom event: ${result}`);
    } catch (err) {
      console.error("Error tracking custom event:", err);
    }
    setTracking(false);
  }, [trackCustomEvent]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-semibold text-2xl text-ruby">
          TDK React - Connect Example
        </h1>
        <ConnectButton
          supportedChainIds={[treasureTopaz.id, arbitrumSepolia.id]}
          onConnected={(method, wallet, nextUser) => {
            console.log("Connect successful:", { method, wallet, nextUser });
            trackCustomEvent({
              address: nextUser?.address,
              name: "wallet-connect",
              properties: {
                method,
                walletId: wallet.id,
              },
            })
              .then((result) => {
                console.log(`Successfully tracked custom event: ${result}`);
              })
              .catch((err) => {
                console.error("Error tracking custom event:", err);
              });
          }}
          onConnectError={(method, err) => {
            console.log("Connect failed:", { method, err });
          }}
        />
      </header>
      <main className="space-y-6">
        {user ? (
          <>
            <div>
              <h1 className="font-medium text-xl">Active Sessions</h1>
              {user.sessions.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {user.sessions
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
                              <span className="rounded bg-ruby px-1 font-medium text-white text-xs uppercase">
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
            {chain.id === arbitrumSepolia.id ? (
              <div className="space-y-1">
                <h1 className="font-medium text-xl">Test Transactions</h1>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => handleMintMagic(1000)}>
                    Mint 1,000 MAGIC
                  </Button>
                  <Button onClick={() => handleRawMintMagic(1000)}>
                    Mint 1,000 MAGIC (Raw)
                  </Button>
                  <Button onClick={() => handleSendNative(0.0001)}>
                    Send 0.0001 ETH
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <h1 className="font-medium text-xl">Test Transactions</h1>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleMintTopazNft}>Mint Topaz NFT</Button>
                  <Button onClick={() => handleSendNative(0.0001)}>
                    Send 0.0001 MAGIC
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-1">
              <h1 className="font-medium text-xl">Test Analytics</h1>
              <div className="flex flex-wrap gap-2">
                <Button onClick={trackClick} disabled={tracking}>
                  {tracking ? "Sending..." : "Track Custom Event"}
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

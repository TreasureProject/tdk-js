import {
  getContractAddress,
  getUserAddress,
  treasureTopaz,
} from "@treasure-dev/tdk-core";
import {
  type AddressString,
  Button,
  ConnectButton,
  useSendRawTransaction,
  useSendTransaction,
  useTreasure,
} from "@treasure-dev/tdk-react";
import { useState } from "react";
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
  const { client, chain, user, userAddress, trackCustomEvent } = useTreasure();
  const { sendTransaction } = useSendTransaction();
  const { sendRawTransaction } = useSendRawTransaction();
  const [tracking, setTracking] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    setLogs((curr) => [log, ...curr]);
  };

  const handleMintMagic = async (amount: number) => {
    addLog(`Minting ${amount} MAGIC...`);

    try {
      const result = await sendTransaction(
        {
          address: getContractAddress(arbitrumSepolia.id, "MAGIC"),
          abi: ERC20_MINTABLE_ABI,
          functionName: "mint",
          args: [userAddress as AddressString, toWei(amount.toString())],
        },
        { chainId: arbitrumSepolia.id },
      );
      addLog(
        `Successfully minted ${amount} MAGIC: ${"transactionHash" in result ? result.transactionHash : "Unknown transaction"}`,
      );
    } catch (err) {
      console.error("Error minting MAGIC:", err);
      addLog(
        `Error minting MAGIC: ${err instanceof Error ? err.message : err}`,
      );
    }
  };

  const handleRawMintMagic = async (amount: number) => {
    const contractAddress = getContractAddress(arbitrumSepolia.id, "MAGIC");

    const contract = getContract({
      client,
      chain,
      address: contractAddress,
      abi: ERC20_MINTABLE_ABI,
    });

    const transaction = prepareContractCall({
      contract,
      method: "mint",
      params: [userAddress as AddressString, toWei(amount.toString())],
    });

    addLog(`Minting ${amount} MAGIC with raw transaction...`);

    try {
      const data = await encode(transaction);
      const result = await sendRawTransaction(
        {
          to: contractAddress,
          data,
        },
        { chainId: arbitrumSepolia.id },
      );
      addLog(
        `Successfully minted ${amount} MAGIC with raw transaction: ${"transactionHash" in result ? result.transactionHash : "Unknown transaction"}`,
      );
    } catch (err) {
      console.error("Error minting MAGIC with raw transaction:", err);
      addLog(`Error minting MAGIC with raw transaction: ${err}`);
    }
  };

  const handleSendNative = async (amount: number, chainId?: number) => {
    const token = chain.id === arbitrumSepolia.id ? "ETH" : "MAGIC";
    addLog(`Sending ${amount} ${token}...`);

    try {
      const result = await sendRawTransaction(
        {
          to: "0xE647b2c46365741e85268ceD243113d08F7E00B8",
          value: toWei(amount.toString()),
          data: "0x",
        },
        { chainId },
      );
      addLog(
        `Successfully sent ${amount} ${token}: ${"transactionHash" in result ? result.transactionHash : "Unknown transaction"}`,
      );
    } catch (err) {
      console.error("Error sending native token:", err);
      addLog(`Error sending ${token}: ${err}`);
    }
  };

  const handleMintTopazNft = async () => {
    addLog("Minting Topaz NFT...");

    try {
      const result = await sendTransaction(
        {
          address: getContractAddress(treasureTopaz.id, "TopazNFT"),
          abi: TOPAZ_NFT_API,
          functionName: "mint",
          args: [],
        },
        { chainId: treasureTopaz.id },
      );
      addLog(
        `Successfully minted Topaz NFT: ${"transactionHash" in result ? result.transactionHash : "Unknown transaction"}`,
      );
    } catch (err) {
      console.error("Error minting Topaz NFT:", err);
      addLog(
        `Error minting Topaz NFT: ${err instanceof Error ? err.message : err}`,
      );
    }
  };

  const trackClick = async () => {
    setTracking(true);
    addLog("Tracking custom event...");

    try {
      const result = await trackCustomEvent({
        name: "test-click",
        properties: { test: "test-value" },
      });
      addLog(`Successfully tracked custom event: ${result}`);
    } catch (err) {
      console.error("Error tracking custom event:", err);
      addLog(`Error tracking custom event: ${err}`);
    }

    setTracking(false);
  };

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
              address: nextUser
                ? getUserAddress(nextUser, chain.id)
                : undefined,
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
            <div className="space-y-1">
              <h1 className="font-medium text-xl">
                Test Transactions (Arbitrum Sepolia)
              </h1>
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
            <div className="space-y-1">
              <h1 className="font-medium text-xl">Test Transactions (Topaz)</h1>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleMintTopazNft}>Mint Topaz NFT</Button>
                <Button
                  onClick={() => handleSendNative(0.0001, treasureTopaz.id)}
                >
                  Send 0.0001 MAGIC
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="font-medium text-xl">Test Analytics</h1>
              <div className="flex flex-wrap gap-2">
                <Button onClick={trackClick} disabled={tracking}>
                  {tracking ? "Sending..." : "Track Custom Event"}
                </Button>
              </div>
            </div>
            {logs.length > 0 ? (
              <div className="space-y-1">
                <h1 className="font-medium text-xl">Logs</h1>
                <ul className="list-disc pl-6">
                  {logs.map((log) => (
                    <li key={log}>{log}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-center">Connect with Treasure to continue</p>
        )}
      </main>
    </div>
  );
};

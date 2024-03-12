import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  type AddressString,
  Button,
  TreasureLoginButton,
  erc20Abi,
  erc1155Abi,
  useApproval,
  useContractAddresses,
  useHarvester,
  useTreasure,
} from "@treasure/tdk-react";
import { formatEther, parseEther, zeroAddress, zeroHash } from "viem";
import { useAccount, useReadContracts } from "wagmi";

const MAGIC_AMOUNT = parseEther("1000");

export const App = () => {
  const { address, tdk, logOut } = useTreasure();
  const { address: eoaAddress = zeroAddress, isConnected: isEOAConnected } =
    useAccount();
  const contractAddresses = useContractAddresses();
  const smartAccountAddress = (address ?? zeroAddress) as AddressString;

  const {
    data: {
      harvesterAddress,
      permitTokenId,
      smartAccountMagic,
      smartAccountPermits,
      harvesterDepositCap,
      harvesterDeposit,
      harvesterPermits,
    },
    deposit,
    withdrawAll,
    refetch: refetchHarvesterData,
  } = useHarvester({ contract: "HarvesterEmerion", userAddress: eoaAddress });

  const {
    data: { eoaMagic = 0n, eoaPermits = 0n } = {},
    refetch: refetchEOABalances,
  } = useReadContracts({
    contracts: [
      {
        address: contractAddresses.MAGIC,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [eoaAddress],
      },
      {
        address: contractAddresses.Consumables,
        abi: erc1155Abi,
        functionName: "balanceOf",
        args: [eoaAddress, permitTokenId],
      },
    ],
    query: {
      enabled: !!address,
      select: (data) => ({
        eoaMagic: data[0].result ?? 0n,
        eoaPermits: data[1].result ?? 0n,
      }),
    },
  });

  const refetch = () => {
    refetchHarvesterData();
    refetchEOABalances();
  };

  // Prepare approval for smart account to transfer MAGIC from EOA
  const { allowance: smartAccountAllowance = 0n, approve: approveMagic } =
    useApproval({
      contractAddress: contractAddresses.MAGIC,
      operatorAddress: smartAccountAddress,
      type: "ERC20",
      amount: MAGIC_AMOUNT,
      onSuccess: () => refetch(),
    });

  // Prepare approval for smart account to transfer Ancient Permits from EOA
  const {
    isApproved: smartAccountPermitsApproved,
    approve: approveAncientPermits,
  } = useApproval({
    contractAddress: contractAddresses.Consumables,
    operatorAddress: smartAccountAddress,
    type: "ERC1155",
    onSuccess: () => refetch(),
  });

  const handleTransfer = async () => {
    if (smartAccountMagic > 0) {
      console.debug(
        "Transferring all MAGIC from smart account to connected wallet",
      );
      await tdk?.transaction.create({
        address: contractAddresses.MAGIC,
        abi: erc20Abi,
        functionName: "transfer",
        args: [eoaAddress, smartAccountMagic],
      });
    }

    if (smartAccountPermits > 0) {
      console.debug(
        "Transferring all Ancient Permits from smart account to connected wallet",
      );
      await tdk?.transaction.create({
        address: contractAddresses.Consumables,
        abi: erc1155Abi,
        functionName: "safeTransferFrom",
        args: [
          smartAccountAddress,
          eoaAddress,
          permitTokenId,
          BigInt(smartAccountPermits),
          zeroHash,
        ],
      });
    }

    refetch();
  };

  const hasInsufficientFunds =
    smartAccountMagic + smartAccountAllowance < MAGIC_AMOUNT;
  const hasDepositCapRemaining =
    harvesterDepositCap - harvesterDeposit >= MAGIC_AMOUNT;
  const hasPermits =
    smartAccountPermits > 0 || (eoaPermits > 0 && smartAccountPermitsApproved);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-ruby-900 text-2xl font-semibold">
          TDK Harvester Example
        </h1>
        {address ? (
          <Button onClick={logOut}>Log Out</Button>
        ) : (
          <TreasureLoginButton />
        )}
      </header>
      <main className="space-y-6">
        {address ? (
          <>
            <div className="space-y-2">
              <h2>
                <span className="font-semibold">Smart Account:</span> {address}
              </h2>
              <ul className="list-disc px-8">
                <li>{formatEther(smartAccountMagic)} MAGIC balance</li>
                <li>{smartAccountPermits.toString()} Ancient Permits</li>
                {isEOAConnected ? (
                  <>
                    <li>
                      {formatEther(smartAccountAllowance)} MAGIC transfer
                      allowance from connected wallet
                    </li>
                    <li>
                      {smartAccountPermitsApproved
                        ? "Approved"
                        : "Not approved"}{" "}
                      for Ancient Permit transfer from connected wallet
                    </li>
                  </>
                ) : null}
              </ul>
              {isEOAConnected &&
              (smartAccountMagic > 0 || smartAccountPermits > 0) ? (
                <Button onClick={handleTransfer}>
                  Transfer assets to connected wallet
                </Button>
              ) : null}
            </div>
            {isEOAConnected ? (
              <div className="space-y-2">
                <h2 className="flex items-center gap-2">
                  <span className="font-semibold">Connected Wallet:</span>{" "}
                  <ConnectButton />
                </h2>
                <ul className="list-disc px-8">
                  <li>{formatEther(eoaMagic)} MAGIC balance</li>
                  <li>{eoaPermits.toString()} Ancient Permits</li>
                </ul>
                <div className="flex flex-wrap items-center gap-1">
                  {hasInsufficientFunds ? (
                    <Button className="block" onClick={() => approveMagic?.()}>
                      Approve smart account for 1,000 MAGIC
                    </Button>
                  ) : null}
                  {smartAccountPermits < 1 && !smartAccountPermitsApproved ? (
                    <Button
                      className="block"
                      onClick={() => approveAncientPermits?.()}
                    >
                      Approve smart account for Ancient Permits
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div>
                Link a wallet to your smart account to increase available funds
                <ConnectButton />
              </div>
            )}
            <div className="space-y-2">
              <h2>
                <span className="font-semibold">Harvester:</span>{" "}
                {harvesterAddress}
              </h2>
              <ul className="list-disc px-8">
                <li>
                  {formatEther(harvesterDepositCap)} MAGIC deposit cap for smart
                  account
                </li>
                <li>
                  {formatEther(harvesterDeposit)} MAGIC deposited by smart
                  account
                </li>
              </ul>
              <div className="flex flex-wrap items-center gap-1">
                <Button
                  disabled={
                    hasInsufficientFunds ||
                    (!hasDepositCapRemaining && !hasPermits)
                  }
                  onClick={async () => {
                    await deposit(MAGIC_AMOUNT);
                    refetch();
                  }}
                >
                  Deposit 1,000 MAGIC to Harvester
                </Button>
                {harvesterDeposit > 0 || harvesterPermits > 0 ? (
                  <Button
                    onClick={async () => {
                      await withdrawAll();
                      refetch();
                    }}
                  >
                    Withdraw All
                  </Button>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

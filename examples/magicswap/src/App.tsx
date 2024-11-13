import {
  type MagicswapPool,
  type MagicswapRoute,
  erc20Abi,
} from "@treasure-dev/tdk-core";
import { Button, ConnectButton, useTreasure } from "@treasure-dev/tdk-react";
import { useEffect, useState } from "react";
import { getContract, toTokens, toUnits, ZERO_ADDRESS } from "thirdweb";
import { allowance, balanceOf } from "thirdweb/extensions/erc20";

const useMagicswapPools = () => {
  const { tdk } = useTreasure();
  const [state, setState] = useState<{
    pools: MagicswapPool[];
    isLoading: boolean;
  }>({ pools: [], isLoading: true });

  useEffect(() => {
    const updatePools = async () => {
      setState((curr) => {
        curr.isLoading = true;
        return curr;
      });
      const { pools: nextPools } = await tdk.magicswap.getPools();
      setState({
        pools: nextPools,
        isLoading: false,
      });
    };

    updatePools();
  }, [tdk]);

  return state;
};

const useMagicswapPool = (id: string) => {
  const { tdk } = useTreasure();
  const [state, setState] = useState<{
    pool: MagicswapPool | undefined;
    isLoading: boolean;
  }>({ pool: undefined, isLoading: true });

  useEffect(() => {
    const updatePool = async () => {
      setState((curr) => {
        curr.isLoading = true;
        return curr;
      });
      const nextPool = await tdk.magicswap.getPool(id);
      setState({
        pool: nextPool,
        isLoading: false,
      });
    };

    updatePool();
  }, [tdk, id]);

  return state;
};

const useMagicswapRoute = ({
  tokenInId,
  tokenOutId,
  amount,
  isExactOut,
}: {
  tokenInId: string;
  tokenOutId: string;
  amount: string;
  isExactOut: boolean;
}) => {
  const { tdk } = useTreasure();
  const [state, setState] = useState<{
    route: MagicswapRoute | undefined;
    isLoading: boolean;
  }>({ route: undefined, isLoading: true });

  useEffect(() => {
    const updateRoute = async () => {
      setState((curr) => {
        curr.isLoading = true;
        return curr;
      });
      const nextRoute = await tdk.magicswap.getRoute({
        tokenInId,
        tokenOutId,
        amount,
        isExactOut,
      });
      setState({
        route: nextRoute,
        isLoading: false,
      });
    };

    updateRoute();
  }, [tdk, tokenInId, tokenOutId, amount, isExactOut]);

  return state;
};

export const PoolDetailsPage = ({
  id,
  addLog,
  onBack,
}: { id: string; addLog: (log: string) => void; onBack: () => void }) => {
  const [amount, setAmount] = useState("10");
  const [tokenInId, setTokenInId] = useState<string | undefined>();

  const { client, chain, tdk, contractAddresses, userAddress } = useTreasure();
  const { pool, isLoading: isLoadingPool } = useMagicswapPool(id);

  const tokenOutId =
    pool?.token0.id === tokenInId ? pool?.token1.id : pool?.token0.id;

  const { route } = useMagicswapRoute({
    tokenInId: tokenInId ?? ZERO_ADDRESS,
    tokenOutId: tokenOutId ?? ZERO_ADDRESS,
    amount,
    isExactOut: false,
  });

  useEffect(() => {
    if (pool?.token0.id) {
      setTokenInId(pool.token0.id);
    }
  }, [pool?.token0.id]);

  const handleSwap = async () => {
    if (!userAddress) {
      throw new Error("No user connected");
    }

    if (!tokenInId || !route) {
      throw new Error("No swap route configured");
    }

    const amountBI = BigInt(toUnits(amount, route.tokenIn.decimals));

    const tokenInContract = getContract({
      client,
      chain,
      address: tokenInId,
      abi: erc20Abi,
    });

    const [tokenInBalance, tokenInAllowance] = await Promise.all([
      balanceOf({
        contract: tokenInContract,
        address: userAddress,
      }),
      allowance({
        contract: tokenInContract,
        owner: userAddress,
        spender: contractAddresses.MagicswapV2Router,
      }),
    ]);

    if (tokenInBalance < amountBI) {
      throw new Error(`Insufficient ${route.tokenIn.symbol} balance`);
    }

    if (tokenInAllowance < amountBI) {
      addLog(`Approving ${amount} ${route.tokenIn.symbol} for trading...`);
      try {
        const result = await tdk.transaction.create({
          address: tokenInId,
          abi: erc20Abi,
          functionName: "approve",
          args: [
            contractAddresses.MagicswapV2Router,
            toUnits(amount, route.tokenIn.decimals),
          ],
        });
        addLog(
          `Successfully approved ${route.tokenIn.symbol}: ${"transactionHash" in result ? result.transactionHash : "Unknown transaction"}`,
        );
      } catch (err) {
        throw new Error(`Error approving ${route.tokenIn.symbol}: ${err}`);
      }
    } else {
      addLog(`${route.tokenIn.symbol} is already approved for trading`);
    }

    addLog(
      `Swapping ${amount} ${route.tokenIn.symbol} for ${route.tokenOut.symbol}...`,
    );
    try {
      const result = await tdk.magicswap.swap({
        tokenInId,
        tokenOutId,
        amountIn: route.amountIn,
        amountOut: route.amountOut,
        path: route.path,
        isExactOut: false,
        toAddress: userAddress,
      });
      addLog(
        `Successfully swapped ${route.tokenIn.symbol} for ${route.tokenOut.symbol}: ${"transactionHash" in result ? result.transactionHash : "Unknown transaction"}`,
      );
    } catch (err) {
      throw new Error(
        `Error swapping ${route.tokenIn.symbol} for ${route.tokenOut.symbol}: ${err}`,
      );
    }
  };

  return (
    <div>
      <button
        type="button"
        className="underline hover:no-underline"
        onClick={() => onBack()}
      >
        &laquo; Back
      </button>
      <h2 className="font-medium text-2xl">Pool Details</h2>
      {pool ? (
        <>
          <p>
            {pool.name} ({pool.id})
          </p>
          <div>
            <h3 className="text-lg">Tokens</h3>
            <ul className="list-disc pl-6">
              <li>
                {pool.token0.symbol} ({pool.token0.id})
              </li>
              <li>
                {pool.token1.symbol} ({pool.token1.id})
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg">Reserves</h3>
            <ul className="list-disc pl-6">
              <li>
                {pool.reserve0} {pool.token0.symbol}
              </li>
              <li>
                {pool.reserve1} {pool.token1.symbol}
              </li>
            </ul>
          </div>
          <div className="space-y-1">
            <h2 className="font-medium text-2xl">Swap</h2>
            <div className="flex items-center">
              <input
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    Number.isNaN(e.target.value) ? "0" : e.target.value || "0",
                  )
                }
              />
              <select
                value={tokenInId}
                onChange={(e) => setTokenInId(e.target.value)}
              >
                <option value={pool.token0.id}>{pool.token0.symbol}</option>
                <option value={pool.token1.id}>{pool.token1.symbol}</option>
              </select>{" "}
              ={" "}
              {route ? (
                <>
                  {toTokens(BigInt(route.amountOut), route.tokenOut.decimals)}{" "}
                  {route.tokenOut.symbol}
                </>
              ) : (
                "Calculating..."
              )}
            </div>
            <Button
              onClick={async () => {
                try {
                  await handleSwap();
                } catch (err) {
                  addLog(
                    err instanceof Error
                      ? err.message
                      : "Unknown error occurred",
                  );
                }
              }}
            >
              Swap
            </Button>
          </div>
        </>
      ) : (
        <p>{isLoadingPool ? "Loading..." : "Pool not found"}</p>
      )}
    </div>
  );
};

export const PoolListPage = ({
  onSelect,
}: { onSelect: (id: string) => void }) => {
  const { pools, isLoading: isLoadingPools } = useMagicswapPools();
  return (
    <div>
      <h2 className="font-medium text-2xl">Pools</h2>
      {pools.length > 0 ? (
        <ul className="list-disc pl-6">
          {pools.map((pool) => (
            <li key={pool.id}>
              <button
                type="button"
                className="underline hover:no-underline"
                onClick={() => onSelect(pool.id)}
              >
                {pool.name} ({pool.id})
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>{isLoadingPools ? "Loading..." : "None"}</p>
      )}
    </div>
  );
};

export const App = () => {
  const [selectedPoolId, setSelectedPoolId] = useState<string | undefined>();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    setLogs((curr) => [log, ...curr]);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-semibold text-2xl text-ruby">
          TDK React - Magicswap Example
        </h1>
        <ConnectButton />
      </header>
      <main className="space-y-6">
        {selectedPoolId ? (
          <PoolDetailsPage
            id={selectedPoolId}
            addLog={addLog}
            onBack={() => setSelectedPoolId(undefined)}
          />
        ) : (
          <PoolListPage onSelect={setSelectedPoolId} />
        )}
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
      </main>
    </div>
  );
};

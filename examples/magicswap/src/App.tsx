import {
  type MagicswapPool,
  type MagicswapRoute,
  erc20Abi,
} from "@treasure-dev/tdk-core";
import { Button, ConnectButton, useTreasure } from "@treasure-dev/tdk-react";
import { useEffect, useState } from "react";
import { toTokens, toUnits } from "thirdweb";

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

const WMAGIC_USDC_POOL_ADDRESS = "0x9c61210b8c8ea450bd3fdbd7a7c1208206d18b7b";
const USDC_ADDRESS = "0x99b9ed17bb37768bb1a3cb6d91b15834eb7c2185";
const WMAGIC_ADDRESS = "0x095ded714d42cbd5fb2e84a0ffbfb140e38dc9e1";

export const App = () => {
  const [amount, setAmount] = useState("10");
  const [tokenInId, setTokenInId] = useState(USDC_ADDRESS);
  const [logs, setLogs] = useState<string[]>([]);
  const tokenOutId =
    tokenInId === WMAGIC_ADDRESS ? USDC_ADDRESS : WMAGIC_ADDRESS;

  const { tdk, contractAddresses, userAddress } = useTreasure();
  const { pools, isLoading: isLoadingPools } = useMagicswapPools();
  const { pool, isLoading: isLoadingPool } = useMagicswapPool(
    WMAGIC_USDC_POOL_ADDRESS,
  );
  const { route } = useMagicswapRoute({
    tokenInId,
    tokenOutId,
    amount,
    isExactOut: false,
  });

  const addLog = (log: string) => {
    setLogs((curr) => [log, ...curr]);
  };

  const handleSwap = async () => {
    if (!route) {
      return;
    }

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
      addLog(`Error approving ${route.tokenIn.symbol}: ${err}`);
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
      addLog(
        `Error swapping ${route.tokenIn.symbol} for ${route.tokenOut.symbol}: ${err}`,
      );
    }
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
        <div>
          <h2 className="font-medium text-2xl">Pools</h2>
          {pools.length > 0 ? (
            <ul className="list-disc pl-6">
              {pools.map((pool) => (
                <li key={pool.id}>
                  {pool.name} ({pool.id})
                </li>
              ))}
            </ul>
          ) : (
            <p>{isLoadingPools ? "Loading..." : "None"}</p>
          )}
        </div>
        <div>
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
            </>
          ) : (
            <p>{isLoadingPool ? "Loading..." : "Pool not found"}</p>
          )}
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
              <option value={USDC_ADDRESS}>USDC</option>
              <option value={WMAGIC_ADDRESS}>WMAGIC</option>
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
          <Button onClick={handleSwap}>Swap</Button>
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
      </main>
    </div>
  );
};

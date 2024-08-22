import { Button, useTreasure } from "@treasure-dev/tdk-react";
import { useEffect, useState } from "react";
import { formatUnits, parseEther, parseUnits } from "viem";
import { formatAmount } from "./helpers/currency";
import { useAddLiquidity } from "./hooks/useAddLiquidity";
import { useERC20Balance } from "./hooks/useERC20Balance";
import type { Pool } from "./hooks/usePool";
import { useRemoveLiquidity } from "./hooks/useRemoveLiquidity";
import { useRoute } from "./hooks/useRoute";
import { useSwap } from "./hooks/useSwap";

const getQuote = (amountA: bigint, reserveA: bigint, reserveB: bigint) =>
  reserveA > 0 ? (amountA * reserveB) / reserveA : 0n;

const bigIntToNumber = (value: bigint, decimals = 18) =>
  Number(formatUnits(value, decimals));

const floorBigInt = (value: bigint, decimals = 18) =>
  parseUnits(
    Math.floor(Number(formatUnits(value, decimals))).toString(),
    decimals,
  );

const getTokenCountForLp = (
  amount: bigint,
  reserve: bigint,
  totalSupply: bigint,
) => (totalSupply > 0 ? (amount * reserve) / totalSupply : 0n);

export const PoolSection = ({ pool }: { pool: Pool }) => {
  const { user } = useTreasure();
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [quoteAmount, setQuoteAmount] = useState<string>("");
  const [baseTokenAmount, setBaseTokenAmount] = useState<string>("");
  const [lpAmount, setLpAmount] = useState<string>("");
  const { route, loading, fetchRoute } = useRoute();
  const { swap, loading: swapLoading } = useSwap();
  const { addLiquidity, loading: addLiquidityLoading } = useAddLiquidity();
  const { removeLiquidity, loading: removeLiquidityLoading } =
    useRemoveLiquidity();
  const lpBalance = useERC20Balance({
    owner: (user?.smartAccountAddress as `0x${string}`) || "0x0",
    tokenAddress: pool.id as `0x${string}`,
  });
  const baseToken =
    pool.token1.isNFT && !pool.isNFTNFT ? pool.token1 : pool.token0;
  const quoteToken =
    pool.token1.isNFT && !pool.isNFTNFT ? pool.token0 : pool.token1;

  const ratio =
    bigIntToNumber(BigInt(quoteToken.reserve), quoteToken.decimals) /
    bigIntToNumber(BigInt(baseToken.reserve), baseToken.decimals);

  const amount0 = getQuote(
    parseUnits(baseTokenAmount, baseToken.decimals),
    BigInt(baseToken.reserve),
    BigInt(quoteToken.reserve),
  );
  const amount1 = parseUnits(baseTokenAmount, baseToken.decimals);

  const [tokenIn, tokenOut] =
    selectedToken === pool?.token0.id
      ? [pool?.token0, pool?.token1]
      : [pool?.token1, pool?.token0];

  useEffect(() => {
    if (pool?.token0.id) {
      setSelectedToken(pool.token0.id);
    }
  }, [pool?.token0.id]);

  const amount = parseEther(lpAmount);

  const removeRawAmount0 = getTokenCountForLp(
    amount,
    BigInt(pool.token0.reserve),
    BigInt(pool.totalSupply),
  );

  const removeRawAmount1 = getTokenCountForLp(
    amount,
    BigInt(pool.token1.reserve),
    BigInt(pool.totalSupply),
  );

  const removeAmount0 = pool.token0.isNFT
    ? floorBigInt(removeRawAmount0)
    : removeRawAmount0;
  const removeAmount1 = pool.token1.isNFT
    ? floorBigInt(removeRawAmount1)
    : removeRawAmount1;

  return (
    <div className="space-y-4">
      <h2 className="space-y-1 font-medium text-2xl">
        {pool.token0.symbol} / {pool.token1.symbol}
      </h2>
      <div>ID: {pool.id}</div>
      <div>
        <h3 className="font-medium text-xl">Swap</h3>
        <div className="mb-2 flex items-center space-x-2">
          <div>In</div>
          <select
            value={selectedToken}
            className="rounded border p-2"
            onChange={(event) => setSelectedToken(event.target.value)}
          >
            <option value={pool.token0.id}>{pool.token0.symbol}</option>
            <option value={pool.token1.id}>{pool.token1.symbol}</option>
          </select>
          <input
            type="number"
            min="0"
            value={quoteAmount}
            onChange={(event) => setQuoteAmount(event.target.value)}
            className="rounded border p-2"
            placeholder="Amount"
          />
          <Button
            onClick={() => {
              if (tokenIn && tokenOut) {
                fetchRoute({
                  tokenInId: tokenIn.id,
                  tokenOutId: tokenOut.id,
                  amount: quoteAmount,
                });
              }
            }}
            disabled={!quoteAmount || loading}
          >
            QUOTE
          </Button>
        </div>

        {!route ? (
          <div>
            {loading ? "Loading..." : "Add input amount to see the route"}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div>
              Out:{" "}
              {formatAmount(
                formatUnits(BigInt(route.amountOut), tokenOut?.decimals ?? 18),
              )}{" "}
              {route.tokenOut.symbol}
            </div>
            <Button
              onClick={() => {
                if (tokenIn && tokenOut && user) {
                  swap({
                    address: user?.smartAccountAddress,
                    route,
                  });
                }
              }}
              disabled={!quoteAmount || loading || swapLoading}
            >
              SWAP
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-xl">Add Liquidity</h3>
        <div className="flex space-x-2">
          <div>1 {baseToken.symbol}</div>
          <div>&lt;=&gt;</div>
          <div>{`${formatAmount(ratio)} ${quoteToken.symbol}`}</div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            value={baseTokenAmount}
            onChange={(event) => setBaseTokenAmount(event.target.value)}
            className="rounded border p-2"
            placeholder={baseToken.symbol}
          />
          <span>=&gt;</span>
          <div>{`${formatAmount(ratio * Number(baseTokenAmount))} ${
            quoteToken.symbol
          }`}</div>
        </div>
        <Button
          onClick={() => {
            if (baseToken && quoteToken && user) {
              addLiquidity({
                pool,
                amount0: amount0.toString(),
                amount1: amount1.toString(),
                address: user.smartAccountAddress,
              });
            }
          }}
          disabled={!baseTokenAmount || loading || addLiquidityLoading}
        >
          ADD LIQUIDITY
        </Button>
      </div>
      <div className="space-y-1">
        <h3 className="font-medium text-xl">Remove Liquidity</h3>
        <div className="flex space-x-2">
          <div>LP Token Balance: {formatAmount(bigIntToNumber(lpBalance))}</div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            max={lpBalance.toString()}
            value={lpAmount}
            onChange={(event) => setLpAmount(event.target.value)}
            className="rounded border p-2"
            placeholder="LP Token"
          />
          <div>
            MAGIC:{" "}
            {formatAmount(formatUnits(removeAmount0, pool.token0.decimals))}
          </div>
          <div>&amp;&amp;</div>
          <div>
            Treasures:{" "}
            {formatAmount(formatUnits(removeAmount1, pool.token1.decimals))}
          </div>
        </div>
        <Button
          onClick={() => {
            if (baseToken && quoteToken && user) {
              removeLiquidity({
                pool,
                amountLP: amount.toString(),
                amount0: removeAmount0.toString(),
                amount1: removeAmount1.toString(),
              });
            }
          }}
          disabled={!lpAmount || loading || removeLiquidityLoading}
        >
          REMOVE LIQUIDITY
        </Button>
      </div>
    </div>
  );
};

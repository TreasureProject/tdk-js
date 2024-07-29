import { Button, formatAmount, useTreasure } from "@treasure-dev/tdk-react";
import { useEffect, useState } from "react";
import { formatEther, formatUnits } from "viem";
import { useAllowance } from "./hooks/useAllowance";
import { useIsApprovedForAll } from "./hooks/useIsApprovedForAll";
import { usePool } from "./hooks/usePool";
import { usePools } from "./hooks/usePools";
import { useRoute } from "./hooks/useRoute";
import { useSwap } from "./hooks/useSwap";

export const MagicSwapSection = () => {
  const { user, contractAddresses } = useTreasure();
  const magicAllowance = useAllowance({
    owner: user?.smartAccountAddress,
    tokenAddress: contractAddresses.MAGIC,
    spenderAddress: contractAddresses.MagicswapV2Router,
  });
  const areTreasuresApproved = useIsApprovedForAll({
    owner: user?.smartAccountAddress,
    tokenAddress: contractAddresses.Treasures,
    spenderAddress: contractAddresses.MagicswapV2Router,
  });
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [quoteAmount, setQuoteAmount] = useState<string>("");

  const pools = usePools();
  const magicTreasuresPool = usePool(
    "0x0626699bc82858c16ae557b2eaad03a58cfcc8bd",
  );
  const { route, loading, fetchRoute } = useRoute();
  const { swap } = useSwap();

  const [tokenIn, tokenOut] =
    selectedToken === magicTreasuresPool?.token0.id
      ? [magicTreasuresPool?.token0, magicTreasuresPool?.token1]
      : [magicTreasuresPool?.token1, magicTreasuresPool?.token0];

  useEffect(() => {
    if (magicTreasuresPool?.token0.id) {
      setSelectedToken(magicTreasuresPool.token0.id);
    }
  }, [magicTreasuresPool?.token0.id]);

  return (
    <div className="space-y-2">
      <h1 className="font-medium text-3xl">Magic Swap</h1>
      <div>
        {!magicTreasuresPool ? (
          "Loading..."
        ) : (
          <div>
            <h2 className="font-medium text-2xl">
              {magicTreasuresPool.token0.symbol} /{" "}
              {magicTreasuresPool.token1.symbol}
            </h2>
            <div>ID: {magicTreasuresPool.id}</div>
            <h3 className="font-medium text-xl">Quote</h3>
            <div className="mb-2 flex items-center space-x-2">
              <div>In</div>
              <select
                value={selectedToken}
                className="rounded border p-2"
                onChange={(event) => setSelectedToken(event.target.value)}
              >
                <option value={magicTreasuresPool.token0.id}>
                  {magicTreasuresPool.token0.symbol}
                </option>
                <option value={magicTreasuresPool.token1.id}>
                  {magicTreasuresPool.token1.symbol}
                </option>
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
              <div>Loading...</div>
            ) : (
              <div className="flex items-center space-x-2">
                <div>
                  Out:{" "}
                  {formatAmount(
                    formatUnits(
                      BigInt(route.amountOut),
                      tokenOut?.decimals ?? 18,
                    ),
                  )}{" "}
                  {route.tokenOut.symbol}
                </div>
                <Button
                  onClick={() => {
                    if (tokenIn && tokenOut) {
                      swap({
                        address: user?.smartAccountAddress,
                        route,
                      });
                    }
                  }}
                  disabled={!quoteAmount || loading}
                >
                  SWAP
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <h2 className="font-medium text-2xl">Relevant State</h2>
      <div>
        {magicAllowance === null
          ? "Loading..."
          : `Magic Allowance: ${formatAmount(
              formatEther(magicAllowance),
            )} MAGIC`}
      </div>
      <div>
        {areTreasuresApproved === null
          ? "Loading..."
          : `Are treasures approved: ${areTreasuresApproved ? "yes" : "no"}`}
      </div>
      <div>{pools.length === 0 ? "Loading..." : `Pools: ${pools.length}`}</div>
    </div>
  );
};

import { useTreasure } from "@treasure-dev/tdk-react";
import { formatEther } from "viem";

import { PoolSection } from "./PoolSection";
import { formatAmount } from "./helpers/currency";
import { useAllowance } from "./hooks/useAllowance";
import { useIsApprovedForAll } from "./hooks/useIsApprovedForAll";
import { usePool } from "./hooks/usePool";
import { usePools } from "./hooks/usePools";

export const MagicSwapSection = () => {
  const { user, contractAddresses } = useTreasure();
  const magicAllowance = useAllowance({
    owner: user?.smartAccountAddress,
    tokenAddress: contractAddresses.MAGIC,
    spenderAddress: contractAddresses.MagicswapV2Router,
  });
  const lpAllowance = useAllowance({
    owner: user?.smartAccountAddress,
    tokenAddress: "0x0626699bc82858c16ae557b2eaad03a58cfcc8bd",
    spenderAddress: contractAddresses.MagicswapV2Router,
  });
  const areTreasuresApproved = useIsApprovedForAll({
    owner: user?.smartAccountAddress,
    tokenAddress: contractAddresses.Treasures,
    spenderAddress: contractAddresses.MagicswapV2Router,
  });

  const pools = usePools();
  const magicTreasuresPool = usePool(
    "0x0626699bc82858c16ae557b2eaad03a58cfcc8bd",
  );

  return (
    <div className="space-y-2">
      <h1 className="font-medium text-3xl">Magic Swap</h1>
      <div>
        {!magicTreasuresPool ? (
          "Loading..."
        ) : (
          <PoolSection pool={magicTreasuresPool} />
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
        {lpAllowance === null
          ? "Loading..."
          : `LP Token Allowance: ${formatAmount(
              formatEther(lpAllowance),
            )} LP Token`}
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

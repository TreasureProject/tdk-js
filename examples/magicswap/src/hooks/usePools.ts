import { useTreasure } from "@treasure-dev/tdk-react";
import { useCallback, useEffect, useState } from "react";

export const usePools = () => {
  const { tdk } = useTreasure();
  const [pools, setPools] = useState<
    Awaited<ReturnType<typeof tdk.magicswap.getPools>>["pools"]
  >([]);

  const fetchPools = useCallback(async () => {
    const response = await tdk.magicswap.getPools();
    setPools(response.pools);
  }, [tdk]);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  return pools;
};

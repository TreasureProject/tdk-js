import { useTreasure } from "@treasure-dev/tdk-react";
import { useCallback, useEffect, useState } from "react";

export const usePool = (poolId: string) => {
  const { tdk } = useTreasure();
  const [pool, setPool] =
    useState<Awaited<ReturnType<typeof tdk.magicswap.getPool>>>();

  const fetchPool = useCallback(async () => {
    const response = await tdk.magicswap.getPool(poolId);
    setPool(response);
  }, [tdk, poolId]);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  return pool;
};

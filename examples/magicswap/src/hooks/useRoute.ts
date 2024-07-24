import { useTreasure } from "@treasure-dev/tdk-react";
import { useCallback, useState } from "react";

export const useRoute = () => {
  const { tdk } = useTreasure();
  const [route, setRoute] =
    useState<Awaited<ReturnType<typeof tdk.magicswap.getRoute>>>();
  const [loading, setLoading] = useState(false);

  const fetchRoute = useCallback(
    async ({
      tokenInId,
      tokenOutId,
      amount,
      isExactOut = false,
    }: {
      tokenInId: string;
      tokenOutId: string;
      amount: string;
      isExactOut?: boolean;
    }) => {
      if (tokenInId && tokenOutId && amount) {
        setLoading(true);
        setRoute(undefined);
        try {
          const response = await tdk.magicswap.getRoute({
            tokenInId,
            tokenOutId,
            amount,
            isExactOut,
          });
          setRoute(response);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    },
    [tdk],
  );

  return { route, loading, fetchRoute };
};

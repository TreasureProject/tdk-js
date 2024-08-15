import { useTreasure } from "@treasure-dev/tdk-react";
import { useCallback, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import type { Pool } from "./usePool";

const floorBigInt = (value: bigint, decimals = 18) =>
  parseUnits(
    Math.floor(Number(formatUnits(value, decimals))).toString(),
    decimals,
  );

const getRandomNfts = (
  availableNfts: { balance: bigint; tokenId: string }[],
  n: number,
) => {
  if (availableNfts.length === 0) return [];

  // Shuffle availableNfts and select up to `n` NFTs
  const shuffledNfts = [...availableNfts].sort(() => 0.5 - Math.random());
  const selectedNfts = shuffledNfts.slice(0, Math.min(n, availableNfts.length));

  // Distribute quantities among selected NFTs
  const result = [];
  let remainingQuantity = n;

  for (let i = 0; i < selectedNfts.length; i++) {
    const quantity = Math.floor(remainingQuantity / (selectedNfts.length - i));
    result.push({ id: selectedNfts[i].tokenId, quantity });
    remainingQuantity -= quantity;
  }

  // Adjust the remaining quantity
  if (remainingQuantity > 0) {
    result[result.length - 1].quantity += remainingQuantity;
  }

  return result;
};

const getAmountMin = (amount: bigint, slippage: number) =>
  amount - (amount * BigInt(Math.ceil(slippage * 1000))) / 1000n;

export const useRemoveLiquidity = () => {
  const { tdk } = useTreasure();
  const [loading, setLoading] = useState(false);

  const removeLiquidity = useCallback(
    async ({
      pool,
      amountLP,
      amount0,
      amount1,
    }: {
      amountLP: string;
      amount0: string;
      amount1: string;
      pool: Pool;
    }) => {
      setLoading(true);
      const { token0, token1 } = pool;

      try {
        let nfts0: { id: string; quantity: number }[] | undefined;
        let nfts1: { id: string; quantity: number }[] | undefined;

        if (token0.isNFT) {
          const vaultTokenIds = token0.vaultCollections?.[0].tokenIds || [];

          nfts0 = token0.isNFT
            ? getRandomNfts(
                vaultTokenIds.map((id) => ({
                  tokenId: id,
                  balance: BigInt(20), // TODO: replace this with vault balance
                })),
                Number(
                  formatUnits(
                    floorBigInt(BigInt(amount0), token0?.decimals),
                    token0?.decimals ?? 18,
                  ),
                ),
              )
            : undefined;
        }

        if (token1.isNFT) {
          const vaultTokenIds = token1.vaultCollections?.[0].tokenIds || [];

          nfts1 = token1.isNFT
            ? getRandomNfts(
                vaultTokenIds.map((id) => ({
                  tokenId: id,
                  balance: BigInt(20), // TODO: replace this with vault balance
                })),
                Number(
                  formatUnits(
                    floorBigInt(BigInt(amount1), token1.decimals),
                    token1.decimals ?? 18,
                  ),
                ),
              )
            : undefined;
        }

        const response = await tdk.magicswap.removeLiquidity(pool.id, {
          nfts0,
          nfts1,
          amountLP,
          amount0Min: token0.isNFT
            ? amount0
            : getAmountMin(BigInt(amount0), 0.01).toString(),
          amount1Min: token1.isNFT
            ? amount1
            : getAmountMin(BigInt(amount1), 0.01).toString(),
        });
        return response;
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [tdk],
  );

  return { loading, removeLiquidity };
};

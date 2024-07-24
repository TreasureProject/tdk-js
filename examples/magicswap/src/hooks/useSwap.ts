import { useTreasure } from "@treasure-dev/tdk-react";
import { useCallback, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { getERC1155Balances } from "../helpers/getERC1155Balances";

type UseTreasure = ReturnType<typeof useTreasure>;
type Route = Awaited<ReturnType<UseTreasure["tdk"]["magicswap"]["getRoute"]>>;

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

export const useSwap = () => {
  const { tdk } = useTreasure();
  const [loading, setLoading] = useState(false);

  const swap = useCallback(
    async ({
      address,
      route,
      isExactOut = false,
    }: {
      address: string;
      route: Route;
      isExactOut?: boolean;
    }) => {
      setLoading(true);
      const { path, tokenIn, tokenOut, amountIn, amountOut } = route;

      let nftsIn: { id: string; quantity: number }[] | undefined;

      try {
        let nftsOut: { id: string; quantity: number }[] | undefined;

        if (tokenIn.isNFT) {
          const vaultTokenIds = tokenIn.vaultCollections?.[0].tokenIds || [];
          const balances = await getERC1155Balances({
            owner: address,
            tokenAddress: tokenIn.collectionId,
            tokenIds: vaultTokenIds,
          });
          nftsIn = tokenIn.isNFT
            ? getRandomNfts(
                balances.filter((balance) => balance.balance > 0),
                Number(
                  formatUnits(
                    floorBigInt(BigInt(amountIn), tokenIn?.decimals),
                    tokenIn?.decimals ?? 18,
                  ),
                ),
              )
            : undefined;
        }

        if (tokenOut.isNFT) {
          const vaultTokenIds = tokenOut.vaultCollections?.[0].tokenIds || [];
          nftsOut = tokenOut.isNFT
            ? getRandomNfts(
                vaultTokenIds.map((id) => ({
                  tokenId: id,
                  balance: BigInt(20), // TODO: replace this with vault balance
                })),
                Number(
                  formatUnits(
                    floorBigInt(BigInt(amountOut), tokenOut?.decimals),
                    tokenOut?.decimals ?? 18,
                  ),
                ),
              )
            : undefined;
        }

        const response = await tdk.magicswap.swap({
          tokenInId: tokenIn.id,
          tokenOutId: tokenOut.id,
          nftsIn,
          nftsOut,
          amountIn,
          amountOut,
          isExactOut,
          path,
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

  return { loading, swap };
};

import {
  ConstantProductRPool,
  type NetworkInfo,
  type RToken,
  findMultiRouteExactIn,
  findMultiRouteExactOut,
} from "@sushiswap/tines";
import { toUnits } from "thirdweb";

import type { AddressString } from "../types";
import { multiplyArray, sumArray } from "../utils/array";
import { bigIntToNumber } from "../utils/number";
import type { Pool } from "./fetchPools";
import type { PoolToken } from "./types";

const tokenToRToken = ({
  name,
  symbol,
  id: address,
  decimals,
}: PoolToken): RToken => ({
  name,
  symbol,
  address,
  decimals,
});

const createSwapRoute = (
  tokenIn: PoolToken,
  tokenOut: PoolToken | null,
  pools: Pool[],
  amount: bigint,
  isExactOut: boolean,
) => {
  if (amount <= 0 || !tokenOut) {
    return undefined;
  }

  const rTokenIn = tokenToRToken(tokenIn);
  const rTokenOut = tokenToRToken(tokenOut);
  const rPools = pools.map(
    ({ id, token0, token1, reserve0, reserve1, totalFee }) => {
      return new ConstantProductRPool(
        id as AddressString,
        tokenToRToken(token0),
        tokenToRToken(token1),
        Number(totalFee ?? 0),
        toUnits(reserve0.toString(), token0.decimals),
        toUnits(reserve1.toString(), token0.decimals),
      );
    },
  );
  const networks: NetworkInfo[] = [
    {
      baseToken: {
        name: "ETH",
        symbol: "ETH",
        address: "0x0",
        decimals: 18,
      },
      gasPrice: 0,
    },
  ];

  if (isExactOut) {
    return findMultiRouteExactOut(
      rTokenIn,
      rTokenOut,
      amount,
      rPools,
      networks,
    );
  }

  return findMultiRouteExactIn(rTokenIn, rTokenOut, amount, rPools, networks);
};

export const getSwapRoute = ({
  pools,
  tokenInId,
  tokenOutId,
  amount,
  isExactOut,
}: {
  pools: Pool[];
  tokenInId: string;
  tokenOutId: string;
  amount: string;
  isExactOut: boolean;
}) => {
  const poolTokens = pools
    .flatMap(({ token0, token1 }) => [token0, token1])
    .reduce(
      (acc, poolToken) => {
        acc[poolToken.id] = poolToken;
        return acc;
      },
      {} as Record<string, PoolToken>,
    );

  const tokenIn = poolTokens[tokenInId];
  const tokenOut = poolTokens[tokenOutId];

  if (!tokenIn) {
    throw new Error(`Token ${tokenInId} not found`);
  }

  if (!tokenOut) {
    throw new Error(`Token ${tokenOutId} not found`);
  }

  const amountBI = toUnits(
    amount,
    isExactOut ? tokenOut.decimals : tokenIn.decimals,
  );

  const isSampleRoute = amountBI <= 0;

  const {
    amountInBI = 0n,
    amountOutBI = 0n,
    legs = [],
    priceImpact = 0,
  } = createSwapRoute(
    tokenIn,
    tokenOut,
    pools,
    isSampleRoute ? 1n : amountBI,
    isExactOut,
  ) ?? {};

  const poolLegs = legs
    .map(({ poolAddress, tokenFrom, tokenTo }) => {
      const pool = pools.find((pool) => pool.id === poolAddress);
      if (!pool) {
        return undefined;
      }
      return {
        ...pool,
        tokenFrom:
          pool.token0.id === tokenFrom.address ? pool.token0 : pool.token1,
        tokenTo: pool.token0.id === tokenTo.address ? pool.token0 : pool.token1,
      };
    })
    .filter((leg) => !!leg) as (Pool & {
    tokenFrom: PoolToken;
    tokenTo: PoolToken;
  })[];

  return {
    amountIn: isSampleRoute ? 0n : amountInBI,
    amountOut: isSampleRoute ? 0n : amountOutBI,
    tokenIn: poolLegs[0]?.tokenFrom ?? tokenIn,
    tokenOut: poolLegs[poolLegs.length - 1]?.tokenTo ?? tokenOut ?? undefined,
    legs,
    path: poolLegs.flatMap(({ tokenFrom, tokenTo }, i) =>
      i === poolLegs.length - 1
        ? [tokenFrom.id as AddressString, tokenTo.id as AddressString]
        : (tokenFrom.id as AddressString),
    ),
    priceImpact,
    derivedValue: multiplyArray(
      poolLegs.map(
        ({ tokenFrom, tokenTo }) =>
          bigIntToNumber(BigInt(tokenFrom.reserve), tokenFrom.decimals) /
          bigIntToNumber(BigInt(tokenTo.reserve), tokenTo.decimals),
      ),
    ),
    lpFee: sumArray(poolLegs.map(({ lpFee }) => Number(lpFee))),
    protocolFee: sumArray(
      poolLegs.map(({ protocolFee }) => Number(protocolFee)),
    ),
    royaltiesFee: sumArray(
      poolLegs.map(({ royaltiesFee }) => Number(royaltiesFee)),
    ),
  };
};

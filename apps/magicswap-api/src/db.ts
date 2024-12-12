import { PrismaClient } from "@prisma/client";
import { getChainId } from "./utils/chain";
import { uint8ArrayToHexString } from "./utils/hex";

// TODO: convert to readonly client: https://www.prisma.io/blog/client-extensions-preview-8t3w27xkrxxn#example-readonly-client
export const createDatabase = (url: string) =>
  new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  }).$extends({
    result: {
      factory: {
        address: {
          need: { address: true },
          compute: ({ address }) => uint8ArrayToHexString(address),
        },
        protocolFeeBeneficiary: {
          need: { protocolFeeBeneficiary: true },
          compute: ({ protocolFeeBeneficiary }) =>
            protocolFeeBeneficiary
              ? uint8ArrayToHexString(protocolFeeBeneficiary)
              : null,
        },
      },
      collection: {
        address: {
          need: { address: true },
          compute: ({ address }) => uint8ArrayToHexString(address),
        },
      },
      vaultCollection: {
        vaultAddress: {
          need: { vaultAddress: true },
          compute: ({ vaultAddress }) => uint8ArrayToHexString(vaultAddress),
        },
        collectionAddress: {
          need: { collectionAddress: true },
          compute: ({ collectionAddress }) =>
            uint8ArrayToHexString(collectionAddress),
        },
      },
      vaultReserveItem: {
        vaultAddress: {
          need: { vaultAddress: true },
          compute: ({ vaultAddress }) => uint8ArrayToHexString(vaultAddress),
        },
        collectionAddress: {
          need: { collectionAddress: true },
          compute: ({ collectionAddress }) =>
            uint8ArrayToHexString(collectionAddress),
        },
      },
      token: {
        chainId: {
          need: { chain: true },
          compute: ({ chain }) => getChainId(chain),
        },
        address: {
          need: { address: true },
          compute: ({ address }) => uint8ArrayToHexString(address),
        },
        decimals: {
          need: { decimals: true },
          compute: ({ decimals }) => decimals.toNumber(),
        },
        derivedMagic: {
          need: { derivedMagic: true },
          compute: ({ derivedMagic }) => derivedMagic.toString(),
        },
      },
      pair: {
        chainId: {
          need: { chain: true },
          compute: ({ chain }) => getChainId(chain),
        },
        address: {
          need: { address: true },
          compute: ({ address }) => uint8ArrayToHexString(address),
        },
        factoryAddress: {
          need: { factoryAddress: true },
          compute: ({ factoryAddress }) =>
            uint8ArrayToHexString(factoryAddress),
        },
        token0Address: {
          need: { token0Address: true },
          compute: ({ token0Address }) => uint8ArrayToHexString(token0Address),
        },
        token1Address: {
          need: { token1Address: true },
          compute: ({ token1Address }) => uint8ArrayToHexString(token1Address),
        },
        reserve0: {
          need: { reserve0: true },
          compute: ({ reserve0 }) => reserve0.toString(),
        },
        reserve1: {
          need: { reserve1: true },
          compute: ({ reserve1 }) => reserve1.toString(),
        },
        reserveUsd: {
          need: { reserveUsd: true },
          compute: ({ reserveUsd }) => reserveUsd.toNumber(),
        },
        totalSupply: {
          need: { totalSupply: true },
          compute: ({ totalSupply }) => totalSupply.toString(),
        },
        txCount: {
          need: { txCount: true },
          compute: ({ txCount }) => txCount.toString(),
        },
        volumeUsd: {
          need: { volumeUsd: true },
          compute: ({ volumeUsd }) => volumeUsd.toNumber(),
        },
        lpFee: {
          need: { lpFee: true },
          compute: ({ lpFee }) => lpFee.toString(),
        },
        protocolFee: {
          need: { protocolFee: true },
          compute: ({ protocolFee }) => protocolFee.toString(),
        },
        royaltiesFee: {
          need: { royaltiesFee: true },
          compute: ({ royaltiesFee }) => royaltiesFee.toString(),
        },
        royaltiesBeneficiary: {
          need: { royaltiesBeneficiary: true },
          compute: ({ royaltiesBeneficiary }) =>
            royaltiesBeneficiary
              ? uint8ArrayToHexString(royaltiesBeneficiary)
              : null,
        },
        totalFee: {
          need: { totalFee: true },
          compute: ({ totalFee }) => totalFee.toString(),
        },
      },
    },
  });

export type Database = ReturnType<typeof createDatabase>;

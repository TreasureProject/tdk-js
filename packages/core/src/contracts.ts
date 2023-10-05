import { arbitrum, arbitrumGoerli } from "viem/chains";

import type { AddressString } from "./types";

export type TreasureContract = "MAGIC" | "ARB" | "PaymentsModule";

export const TREASURE_CONTRACT_ADDRESSES: Record<
  number,
  Record<TreasureContract, AddressString>
> = {
  [arbitrum.id]: {
    MAGIC: "0x539bde0d7dbd336b79148aa742883198bbf60342",
    ARB: "0x912ce59144191c1204e64559fe8253a0e49e6548",
    PaymentsModule: "0xf325ac5c9dc74a3c3b7f2474a709154e9f6bc194",
  },
  [arbitrumGoerli.id]: {
    MAGIC: "0x88f9efb3a7f728fdb2b8872fe994c84b1d148f65",
    ARB: "0xf861378b543525ae0c47d33c90c954dc774ac1f9",
    PaymentsModule: "0x366a17839a625b87b114be0ab5a45a979959702b",
  },
};

export const getTreasureContractAddresses = (chainId: number) => {
  const addresses = TREASURE_CONTRACT_ADDRESSES[chainId];
  return addresses ?? TREASURE_CONTRACT_ADDRESSES[arbitrum.id];
};

export const getTreasureContractAddress = (
  chainId: number,
  contract: TreasureContract,
) => getTreasureContractAddresses(chainId)[contract];

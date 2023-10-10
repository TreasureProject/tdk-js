import type { TreasureContract } from "@treasure/core";
import {
  TREASURE_CONTRACT_ADDRESSES,
  getTreasureContractAddress,
} from "@treasure/core";
import { useChainId } from "wagmi";
import { arbitrum } from "wagmi/chains";

export const useTreasureContractAddress = (contract: TreasureContract) => {
  const chainId = useChainId();
  return {
    address: getTreasureContractAddress(chainId, contract),
  };
};

export const useTreasureContractAddresses = () => {
  const chainId = useChainId();
  if (!TREASURE_CONTRACT_ADDRESSES[chainId]) {
    return TREASURE_CONTRACT_ADDRESSES[arbitrum.id];
  }

  return TREASURE_CONTRACT_ADDRESSES[chainId];
};

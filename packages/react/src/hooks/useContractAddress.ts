import {
  type Contract,
  getContractAddress,
  getContractAddresses,
} from "@treasure-dev/tdk-core";

import { useTreasure } from "../providers/treasure";

export const useContractAddress = ({
  chainId,
  contract,
}: { chainId?: number; contract: Contract }) => {
  const { chain } = useTreasure();
  return getContractAddress(chainId ?? chain.id, contract);
};

export const useContractAddresses = ({ chainId }: { chainId?: number }) => {
  const { chain } = useTreasure();
  return getContractAddresses(chainId ?? chain.id);
};

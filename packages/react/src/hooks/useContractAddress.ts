import {
  type Contract,
  getContractAddress,
  getContractAddresses,
} from "@treasure-dev/tdk-core";
import { useChainId } from "wagmi";

export const useContractAddress = (contract: Contract) => {
  const chainId = useChainId();
  return {
    address: getContractAddress(chainId, contract),
  };
};

export const useContractAddresses = () => {
  const chainId = useChainId();
  return getContractAddresses(chainId);
};

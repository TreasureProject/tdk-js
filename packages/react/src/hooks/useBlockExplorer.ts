import { useNetwork } from "wagmi";
import { arbitrum } from "wagmi/chains";

export const useBlockExplorer = () => {
  const { chain } = useNetwork();
  return chain?.blockExplorers?.default ?? arbitrum.blockExplorers.default;
};

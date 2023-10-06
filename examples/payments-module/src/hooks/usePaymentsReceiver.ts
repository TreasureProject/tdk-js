import { arbitrumGoerli } from "viem/chains";
import { useChainId } from "wagmi";

export const usePaymentsReceiver = () => {
  const chainId = useChainId();
  // Return Kaiju Cards payments receiver implementation
  const address =
    chainId === arbitrumGoerli.id
      ? "0x3a2d12aa889575ffe9c571fdc30efe78a7d187be"
      : "0xb2e806a80d9328b3dc3787313588ce18a44b8653";
  return { address };
};

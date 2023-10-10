import { arbitrumGoerli } from "viem/chains";
import { useChainId } from "wagmi";

export const usePaymentsReceiver = () => {
  const chainId = useChainId();
  // Return Kaiju Cards payments receiver implementation
  const address =
    chainId === arbitrumGoerli.id
      ? "0x3f466d0d3f7283c25c5071c2930338b9c6bf3cd3"
      : "0xb2e806a80d9328b3dc3787313588ce18a44b8653";
  return { address };
};

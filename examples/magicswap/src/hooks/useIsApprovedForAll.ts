import { useEffect, useState } from "react";
import { publicClient } from "../wagmi/client";

export const useIsApprovedForAll = ({
  owner,
  tokenAddress,
  spenderAddress,
}: {
  owner?: string;
  tokenAddress?: string;
  spenderAddress?: string;
}) => {
  const [data, setData] = useState<boolean | null>(null);
  useEffect(() => {
    if (!owner || !tokenAddress || !spenderAddress) {
      return;
    }
    const helper = async () => {
      const data = await publicClient.readContract({
        address: tokenAddress,
        abi: [
          {
            inputs: [
              { internalType: "address", name: "account", type: "address" },
              { internalType: "address", name: "operator", type: "address" },
            ],
            name: "isApprovedForAll",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "isApprovedForAll",
        args: [owner, spenderAddress],
      });

      setData(data);
    };
    helper();
  }, [owner, tokenAddress, spenderAddress]);

  return data;
};

import { useEffect, useState } from "react";
import { publicClient } from "../wagmi/client";

export const useAllowance = ({
  owner,
  tokenAddress,
  spenderAddress,
}: {
  owner?: string;
  tokenAddress?: string;
  spenderAddress?: string;
}) => {
  const [data, setData] = useState<bigint | null>(null);
  useEffect(() => {
    if (!owner || !tokenAddress || !spenderAddress) {
      return;
    }
    const helper = async () => {
      const data = await publicClient.readContract({
        address: tokenAddress,
        abi: [
          {
            constant: true,
            inputs: [
              {
                name: "_owner",
                type: "address",
              },
              {
                name: "_spender",
                type: "address",
              },
            ],
            name: "allowance",
            outputs: [
              {
                name: "",
                type: "uint256",
              },
            ],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "allowance",
        args: [owner, spenderAddress],
      });

      setData(data);
    };
    helper();
  }, [owner, tokenAddress, spenderAddress]);

  return data;
};

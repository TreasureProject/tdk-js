import { useEffect, useState } from "react";
import { erc20Abi } from "viem";
import { publicClient } from "../wagmi/client";

export const useERC20Balance = ({
  owner,
  tokenAddress,
}: {
  owner?: `0x${string}`;
  tokenAddress?: `0x${string}`;
  spenderAddress?: `0x${string}`;
}) => {
  const [data, setData] = useState<bigint>(0n);
  useEffect(() => {
    if (!owner || !tokenAddress) {
      return;
    }
    const helper = async () => {
      const data = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [owner],
      });

      setData(data);
    };
    helper();
  }, [owner, tokenAddress]);

  return data;
};

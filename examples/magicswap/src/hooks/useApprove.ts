import { useTreasure } from "@treasure-dev/tdk-react";
import { useCallback } from "react";
import { parseEther } from "viem";

export const useApprove = (tokenAddress: string, spenderAddress: string) => {
  const { tdk, user } = useTreasure();
  return useCallback(
    async (amount: number) => {
      if (!user?.smartAccountAddress) {
        return;
      }
      try {
        await tdk.transaction.create(
          {
            address: tokenAddress,
            abi: [
              {
                type: "function",
                name: "approve",
                stateMutability: "nonpayable",
                inputs: [
                  {
                    name: "spender",
                    type: "address",
                  },
                  {
                    name: "amount",
                    type: "uint256",
                  },
                ],
                outputs: [
                  {
                    type: "bool",
                  },
                ],
              },
            ] as const,
            functionName: "approve",
            args: [spenderAddress, parseEther(amount.toString())],
          },
          { includeAbi: true },
        );
      } catch (err) {
        console.error("Error approving MAGIC:", err);
      }
    },
    [tdk, user, tokenAddress, spenderAddress],
  );
};

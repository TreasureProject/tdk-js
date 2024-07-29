import { useTreasure } from "@treasure-dev/tdk-react";
import { useCallback } from "react";

export const useSetApprovalForAll = (
  tokenAddress: string,
  spenderAddress: string,
) => {
  const { tdk, user } = useTreasure();
  return useCallback(async () => {
    if (!user?.smartAccountAddress) {
      return;
    }
    try {
      await tdk.transaction.create(
        {
          address: tokenAddress,
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "operator",
                  type: "address",
                },
                { internalType: "bool", name: "approved", type: "bool" },
              ],
              name: "setApprovalForAll",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ] as const,
          functionName: "setApprovalForAll",
          args: [spenderAddress, true],
        },
        { includeAbi: true },
      );
    } catch (err) {
      console.error("Error approving MAGIC:", err);
    }
  }, [tdk, user, tokenAddress, spenderAddress]);
};

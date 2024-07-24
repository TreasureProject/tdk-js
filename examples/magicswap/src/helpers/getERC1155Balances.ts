import { publicClient } from "../wagmi/client";

export const getERC1155Balances = async ({
  owner,
  tokenAddress,
  tokenIds,
}: {
  owner: string;
  tokenAddress: string;
  tokenIds: string[];
}) => {
  const data = await publicClient.readContract({
    address: tokenAddress,
    abi: [
      {
        inputs: [
          { internalType: "address[]", name: "accounts", type: "address[]" },
          { internalType: "uint256[]", name: "ids", type: "uint256[]" },
        ],
        name: "balanceOfBatch",
        outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOfBatch",
    args: [
      Array.from({ length: tokenIds.length }).fill(owner) as string[],
      tokenIds.map((id) => BigInt(id)),
    ],
  });

  return data.map((balance, index) => ({ balance, tokenId: tokenIds[index] }));
};

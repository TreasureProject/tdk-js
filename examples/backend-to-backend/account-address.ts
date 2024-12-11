import {
  TDKAPI,
  generateAccountSignature,
  getContractAddress,
} from "@treasure-dev/tdk-core";
import "dotenv/config";

const chainId = 421614;

(async () => {
  const accountAddress = process.env.TDK_ACCOUNT_ADDRESS as `0x${string}`; // smart account that has already created an on-chain session
  const { backendWallet, signature, expirationTime } =
    await generateAccountSignature({
      accountAddress,
      kmsKey: process.env.TDK_KMS_KEY ?? "",
    });

  const tdk = new TDKAPI({
    baseUri: process.env.TDK_API_URL,
    chainId,
    backendWallet,
  });

  const transaction = await tdk.transaction.create(
    {
      address: getContractAddress(chainId, "MAGIC"),
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "mint",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ] as const,
      functionName: "mint",
      args: [
        accountAddress,
        1000000000000000000000n, // 1,000
      ],
    },
    {
      includeAbi: true,
      accountAddress,
      accountSignature: signature,
      accountSignatureExpiration: expirationTime,
    },
  );
  console.log(transaction);
})();

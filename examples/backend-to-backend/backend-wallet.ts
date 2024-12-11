import {
  TDKAPI,
  createTreasureConnectClient,
  generateBackendWalletSignature,
  getContractAddress,
} from "@treasure-dev/tdk-core";
import "dotenv/config";

const client = createTreasureConnectClient({
  clientId: process.env.TDK_CLIENT_ID ?? "",
});
const chainId = 421614;

(async () => {
  const { backendWallet, signature, expirationTime } =
    await generateBackendWalletSignature({
      client,
      chainId,
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
        backendWallet as `0x${string}`,
        1000000000000000000000n, // 1,000
      ],
    },
    {
      includeAbi: true,
      backendWalletSignature: signature,
      backendWalletSignatureExpiration: expirationTime,
    },
  );
  console.log(transaction);
})();

import {
  TDKAPI,
  createTreasureConnectClient,
  generateBackendWalletSignature,
  treasureTopaz,
} from "@treasure-dev/tdk-core";
import "dotenv/config";

const client = createTreasureConnectClient({
  clientId: process.env.TDK_CLIENT_ID ?? "",
});
const chainId = treasureTopaz.id;

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
      address: "0x99B9ED17bB37768bb1a3Cb6d91B15834EB7c2185",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "mintTo",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ] as const,
      functionName: "mintTo",
      args: [backendWallet as `0x${string}`, 1000000000000000000n],
    },
    {
      includeAbi: true,
      backendWalletSignature: signature,
      backendWalletSignatureExpiration: expirationTime,
    },
  );
  console.log(transaction);
})();

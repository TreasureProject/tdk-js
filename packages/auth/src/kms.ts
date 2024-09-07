import type { KMS } from "@aws-sdk/client-kms";
import { base64url } from "./base64url";

export const kmsSign = async (kms: KMS, keyArn: string, message: string) => {
  const result = await kms.sign({
    Message: Buffer.from(message),
    KeyId: keyArn,
    SigningAlgorithm: "RSASSA_PKCS1_V1_5_SHA_256",
    MessageType: "RAW",
  });
  if (!result.Signature) {
    throw new Error("Unable to generate signature");
  }

  return base64url(result.Signature);
};

export const kmsGetPublicKey = async (kms: KMS, keyArn: string) => {
  const result = await kms.getPublicKey({ KeyId: keyArn });
  if (!result.PublicKey) {
    throw new Error("Unable to fetch public key");
  }

  return `-----BEGIN PUBLIC KEY-----\n${base64url(result.PublicKey)}\n-----END PUBLIC KEY-----`;
};

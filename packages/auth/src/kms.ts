import type { KMS } from "@aws-sdk/client-kms";
import { base64, base64url } from "./base64";

const publicKeyCache: Record<string, string> = {};

export const kmsSign = async (kms: KMS, key: string, message: string) => {
  const result = await kms.sign({
    Message: Buffer.from(message),
    KeyId: key,
    SigningAlgorithm: "RSASSA_PKCS1_V1_5_SHA_256",
    MessageType: "RAW",
  });
  if (!result.Signature) {
    throw new Error("Unable to generate signature");
  }

  return base64url(result.Signature);
};

export const kmsGetPublicKey = async (kms: KMS, key: string) => {
  if (!publicKeyCache[key]) {
    const result = await kms.getPublicKey({ KeyId: key });
    if (!result.PublicKey) {
      throw new Error("Unable to fetch public key");
    }

    publicKeyCache[key] =
      `-----BEGIN PUBLIC KEY-----\n${base64(result.PublicKey)}\n-----END PUBLIC KEY-----`;
  }

  return publicKeyCache[key];
};

import { KMS, type KMSClientConfig } from "@aws-sdk/client-kms";
import jwt from "jsonwebtoken";
import { base64url } from "./base64";
import { kmsGetPublicKey, kmsSign } from "./kms";

type Payload<TContext = unknown> = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  ctx: TContext;
};

type AuthOptions = {
  kmsKey: string;
  kmsClientConfig?: KMSClientConfig;
  issuer?: string;
  audience?: string;
  expirationTimeSeconds?: number;
};

const JWT_HEADER = base64url(
  JSON.stringify({
    alg: "RS256",
    typ: "JWT",
  }),
);

export const createAuth = ({
  kmsKey,
  kmsClientConfig,
  issuer,
  audience,
  expirationTimeSeconds = 86_400, // 1 day
}: AuthOptions) => {
  const kms = kmsClientConfig ? new KMS(kmsClientConfig) : new KMS();
  return {
    generateJWT: async (
      subject: string,
      overrides?: {
        issuer?: string;
        audience?: string;
        expiresAt?: Date;
        issuedAt?: Date;
        context?: unknown;
      },
    ) => {
      const payload: Payload = {
        iss: overrides?.issuer ?? issuer ?? "treasure.lol",
        aud: overrides?.audience ?? audience ?? "treasure.lol",
        sub: subject,
        iat: Math.floor((overrides?.issuedAt ?? new Date()).getTime() / 1000),
        exp:
          Math.floor((overrides?.expiresAt ?? new Date()).getTime() / 1000) +
          expirationTimeSeconds,
        ctx: overrides?.context ?? {},
      };
      const message = `${JWT_HEADER}.${base64url(JSON.stringify(payload))}`;
      const signature = await kmsSign(kms, kmsKey, message);
      return `${message}.${signature}`;
    },
    verifyJWT: async <TContext = unknown>(token: string) => {
      // Decode the token first and run some initial checks before doing a full verification
      const decoded = jwt.decode(token) as Payload<TContext>;

      // Check expiration time
      const now = Math.floor(Date.now() / 1000);
      if (!decoded.exp || decoded.exp < now) {
        throw new Error(
          `Token expired at ${decoded.exp}, current time is ${now}`,
        );
      }

      // Check audience matches
      if (audience && decoded.aud.toLowerCase() !== audience.toLowerCase()) {
        throw new Error(
          `Expected audience "${audience}", but found "${decoded.aud}"`,
        );
      }

      // Check issuer matches
      if (issuer && decoded.iss.toLowerCase() !== issuer.toLowerCase()) {
        throw new Error(
          `Expected issuer "${issuer}", but found "${decoded.iss}"`,
        );
      }

      // Initial checks passed, now verify the token
      const publicKey = await kmsGetPublicKey(kms, kmsKey);
      return jwt.verify(token, publicKey, {
        algorithms: ["RS256"],
      }) as Payload<TContext>;
    },
  };
};

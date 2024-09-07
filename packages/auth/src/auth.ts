import { KMS } from "@aws-sdk/client-kms";
import { decode as decodeJWT, verify as verifyJWT } from "jsonwebtoken";
import { base64url } from "./base64url";
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
  kmsRegion: string;
  kmsKeyArn: string;
  issuer?: string;
  audience?: string;
  expirationTimeSeconds?: number;
};

const ALGORITHM = "RS256";

const JWT_HEADER = base64url(
  JSON.stringify({
    alg: ALGORITHM,
    typ: "JWT",
  }),
);

export const createAuth = ({
  kmsRegion,
  kmsKeyArn,
  issuer = "treasure.lol",
  audience = "treasure.lol",
  expirationTimeSeconds = 86_400, // 1 day
}: AuthOptions) => {
  const kms = new KMS({ region: kmsRegion });
  return {
    generateJWT: async (
      subject: string,
      overrides?: {
        issuer?: string;
        audience?: string;
        expiresAt?: number;
        issuedAt?: number;
        context?: unknown;
      },
    ) => {
      const now = Math.floor(Date.now() / 1000);
      const payload: Payload = {
        iss: overrides?.issuer ?? issuer,
        aud: overrides?.audience ?? audience,
        sub: subject,
        iat: overrides?.issuedAt ?? now,
        exp: overrides?.expiresAt ?? now + expirationTimeSeconds,
        ctx: overrides?.context ?? {},
      };
      const message = JSON.stringify(payload);
      const signature = await kmsSign(kms, kmsKeyArn, message);
      return `${JWT_HEADER}.${base64url(message)}.${signature}`;
    },
    verifyJWT: async <TContext = unknown>(token: string) => {
      // Decode the token first and run some initial checks before doing a full verification
      const decoded = decodeJWT(token) as Payload<TContext>;

      // Check expiration time
      const now = Math.floor(Date.now() / 1000);
      if (!decoded.exp || decoded.exp < now) {
        throw new Error(
          `Token expired at ${decoded.exp}, current time is ${now}`,
        );
      }

      // Check audience matches
      if (decoded.aud !== audience) {
        throw new Error(
          `Expected audience "${audience}", but found "${decoded.aud}"`,
        );
      }

      // Check issuer matches
      if (decoded.iss.toLowerCase() !== issuer.toLowerCase()) {
        throw new Error(
          `Expected issuer "${issuer}", but found "${decoded.iss}"`,
        );
      }

      // Initial checks passed, now verify the token
      const publicKey = await kmsGetPublicKey(kms, kmsKeyArn);
      return verifyJWT(token, publicKey, {
        algorithms: [ALGORITHM],
      }) as Payload<TContext>;
    },
  };
};

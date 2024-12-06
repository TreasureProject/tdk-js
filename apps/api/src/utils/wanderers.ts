import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

import type { LoginCustomReply } from "../schema";

type WanderersData = {
  email: string;
  exp: number;
  sub: string;
};

export const validateWanderersUser = async ({
  jwksUri,
  token,
}: {
  jwksUri: string;
  token: string;
}): Promise<LoginCustomReply | undefined> => {
  const client = jwksClient({
    jwksUri,
  });

  const result = (await new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(
      token,
      async (header, callback) => {
        const key = await client.getSigningKey(header.kid);
        callback(null, key.getPublicKey());
      },
      (err, decoded) => {
        if (err || !decoded || typeof decoded === "string") {
          reject(err);
        } else {
          resolve(decoded);
        }
      },
    );
  })) as WanderersData;

  return {
    userId: result.sub,
    email: result.email,
    exp: result.exp,
  };
};

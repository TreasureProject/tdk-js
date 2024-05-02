import type { FastifyRequest } from "fastify";

import type { ThirdwebAuth } from "../types";

type VerifyJWTResult = Awaited<ReturnType<ThirdwebAuth["verifyJWT"]>>;

export const verifyAuth = async (
  auth: ThirdwebAuth,
  req: FastifyRequest,
): Promise<VerifyJWTResult> => {
  if (!req.headers.authorization) {
    return {
      error: "No authorization header",
      valid: false,
    };
  }

  try {
    const authResult = await auth.verifyJWT({
      jwt: req.headers.authorization.replace("Bearer ", ""),
    });
    return authResult;
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
      valid: false,
    };
  }
};

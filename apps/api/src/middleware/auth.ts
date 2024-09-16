import * as Sentry from "@sentry/node";
import type { AddressString, UserContext } from "@treasure-dev/tdk-core";
import type { FastifyInstance } from "fastify";

import type { TdkApiContext } from "../types";

declare module "fastify" {
  interface FastifyRequest {
    userId: string | undefined;
    userAddress: AddressString | undefined;
    authError: string | undefined;
  }
}

export const withAuth = async (
  app: FastifyInstance,
  { auth, thirdwebAuth }: TdkApiContext,
) => {
  app.decorateRequest("userId", undefined);
  app.decorateRequest("userAddress", undefined);
  app.decorateRequest("authError", undefined);
  app.addHook("onRequest", async (req) => {
    // Parse user info from JWT token header
    if (req.headers.authorization) {
      try {
        const decoded = await auth.verifyJWT<UserContext>(
          req.headers.authorization.replace("Bearer ", ""),
        );
        req.userId = decoded.ctx.id;
        req.userAddress = decoded.sub as AddressString;
        Sentry.setUser({
          id: req.userId,
          username: req.userAddress,
        });
      } catch (err) {
        req.authError = err instanceof Error ? err.message : "Unknown error";
      }

      // Fall back to legacy Thirdweb auth
      if (!req.userAddress) {
        try {
          const authResult = await thirdwebAuth.verifyJWT({
            jwt: req.headers.authorization.replace("Bearer ", ""),
          });
          if (authResult.valid) {
            req.userId = (
              authResult.parsedJWT.ctx as UserContext | undefined
            )?.id;
            req.userAddress = authResult.parsedJWT.sub as AddressString;
            Sentry.setUser({
              id: req.userId,
              username: req.userAddress,
            });
          } else {
            req.authError = authResult.error;
          }
        } catch (err) {
          req.authError = err instanceof Error ? err.message : "Unknown error";
        }
      }
    }
  });
};

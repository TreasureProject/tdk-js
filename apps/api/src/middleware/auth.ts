import * as Sentry from "@sentry/node";
import type { AddressString, UserContext } from "@treasure-dev/tdk-core";
import type { FastifyInstance } from "fastify";

import type { TdkApiContext } from "../types";
import { verifyAuth } from "../utils/auth";

declare module "fastify" {
  interface FastifyRequest {
    userId: string | undefined;
    userAddress: AddressString | undefined;
    overrideUserAddress: AddressString | undefined;
    authError: string | undefined;
  }
}

export const withAuth = async (
  app: FastifyInstance,
  { auth }: TdkApiContext,
) => {
  // Parse JWT header and obtain user address in middleware
  app.decorateRequest("userId", undefined);
  app.decorateRequest("userAddress", undefined);
  app.decorateRequest("overrideUserAddress", undefined);
  app.decorateRequest("authError", undefined);
  app.addHook("onRequest", async (req) => {
    if (req.headers.authorization) {
      const authResult = await verifyAuth(auth, req);
      if (authResult.valid) {
        req.userId = (authResult.parsedJWT.ctx as UserContext | undefined)?.id;
        req.userAddress = authResult.parsedJWT.sub as AddressString;
        Sentry.setUser({
          id: req.userId,
          username: req.userAddress,
        });
      } else {
        req.authError = authResult.error;
      }
    }

    req.overrideUserAddress = req.headers["x-account-address"]?.toString() as
      | AddressString
      | undefined;
    if (req.overrideUserAddress) {
      Sentry.setUser({ username: req.overrideUserAddress });
    }
  });
};

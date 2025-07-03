import * as Sentry from "@sentry/node";
import type { Address } from "thirdweb";

import type { TdkApiContext } from "../types";
import type { App } from "../utils/app";

declare module "fastify" {
  interface FastifyRequest {
    isAuthenticated: boolean;
    authenticatedUserAddress: Address | undefined;
    authenticationError: string | undefined;
  }
}

// ZEE: Middleware decodes JWT and passes user context to route handlers
export const withAuth = (app: App, { thirdwebAuth }: TdkApiContext) => {
  app.decorateRequest("isAuthenticated", false);
  app.decorateRequest("authenticatedUserAddress", undefined);
  app.decorateRequest("authenticationError", undefined);
  app.addHook("onRequest", async (req) => {
    // Check for user address via JWT header
    if (req.headers.authorization) {
      const jwt = req.headers.authorization.replace("Bearer ", "");

      try {
        const result = await thirdwebAuth.verifyJWT({ jwt });
        if (result.valid) {
          req.isAuthenticated = true;
          req.authenticatedUserAddress = (
            result.parsedJWT.ctx as { address: Address }
          ).address;
          Sentry.setUser({
            username: req.authenticatedUserAddress,
          });
        } else {
          req.authenticationError = result.error;
        }
      } catch (err) {
        req.authenticationError =
          err instanceof Error ? err.message : "Unknown error";
      }
    }
  });
};

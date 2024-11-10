import * as Sentry from "@sentry/node";
import {
  type AddressString,
  type UserContext,
  verifyAccountSignature,
} from "@treasure-dev/tdk-core";

import { type Hex, isHex } from "thirdweb";
import type { TdkApiContext } from "../types";
import type { App } from "../utils/app";
import { throwUnauthorizedError } from "../utils/error";

declare module "fastify" {
  interface FastifyRequest {
    userId: string | undefined;
    userAddress: AddressString | undefined;
    backendUserAddress: AddressString | undefined;
    backendWallet: AddressString | undefined;
    authError: string | undefined;
  }
}

export const withAuth = (app: App, { auth }: TdkApiContext) => {
  app.decorateRequest("userId", undefined);
  app.decorateRequest("userAddress", undefined);
  app.decorateRequest("backendUserAddress", undefined);
  app.decorateRequest("backendWallet", undefined);
  app.decorateRequest("authError", undefined);
  app.addHook("onRequest", async (req) => {
    // Check for explicit setting of user address and recover backend wallet address from signature
    if (req.headers["x-account-address"]) {
      const accountAddress = req.headers["x-account-address"].toString();
      const signature = req.headers["x-account-signature"]?.toString();
      if (!isHex(accountAddress) || !isHex(signature)) {
        throwUnauthorizedError("Invalid account address or signature");
      }

      const backendWallet = await verifyAccountSignature({
        accountAddress,
        signature: signature as Hex,
      });
      if (!backendWallet) {
        throwUnauthorizedError("Invalid backend wallet address");
      }

      req.backendUserAddress = accountAddress as AddressString;
      req.backendWallet = backendWallet as AddressString;
      Sentry.setUser({ username: req.backendUserAddress });
      return;
    }

    // All other auth methods require an Authorization header
    if (!req.headers.authorization) {
      return;
    }

    // Check for user address via JWT header
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
  });
};

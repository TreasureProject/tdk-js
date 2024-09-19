import * as Sentry from "@sentry/node";
import type { AddressString, UserContext } from "@treasure-dev/tdk-core";
import { hashMessage, isHex, recoverAddress } from "viem";

import type { TdkApiContext } from "../types";
import type { App } from "../utils/app";
import { throwUnauthorizedError } from "../utils/error";

declare module "fastify" {
  interface FastifyRequest {
    userId: string | undefined;
    userAddress: AddressString | undefined;
    backendWallet: AddressString | undefined;
    authError: string | undefined;
  }
}

export const withAuth = (app: App, { auth, thirdwebAuth }: TdkApiContext) => {
  app.decorateRequest("userId", undefined);
  app.decorateRequest("userAddress", undefined);
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

      const backendWallet = await recoverAddress({
        hash: hashMessage(
          JSON.stringify({
            accountAddress,
          }),
        ),
        signature: signature as AddressString,
      });
      if (!isHex(backendWallet)) {
        throwUnauthorizedError("Invalid backend wallet address");
      }

      req.userAddress = accountAddress as AddressString;
      req.backendWallet = backendWallet as AddressString;
      Sentry.setUser({ username: req.userAddress });
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
      return;
    } catch (err) {
      req.authError = err instanceof Error ? err.message : "Unknown error";
    }

    // Fall back to legacy Thirdweb auth
    // TODO: remove fallback when all legacy JWTs expire
    try {
      const authResult = await thirdwebAuth.verifyJWT({
        jwt: req.headers.authorization.replace("Bearer ", ""),
      });
      if (authResult.valid) {
        req.authError = undefined;
        req.userId = (authResult.parsedJWT.ctx as UserContext | undefined)?.id;
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
  });
};

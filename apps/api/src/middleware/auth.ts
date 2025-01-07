import * as Sentry from "@sentry/node";
import {
  type UserContext,
  verifyAccountSignature,
  verifyBackendWalletSignature,
} from "@treasure-dev/tdk-core";
import { type Address, isAddress, isHex } from "thirdweb";

import type { TdkApiContext } from "../types";
import type { App } from "../utils/app";
import { createUnauthorizedError } from "../utils/error";

declare module "fastify" {
  interface FastifyRequest {
    isAuthenticated: boolean;
    authenticatedUserId: string | undefined;
    authenticatedUserAddress: Address | undefined;
    authenticationError: string | undefined;
    isBackendRequest: boolean;
    verifiedBackendWallet: Address | undefined;
    verifiedBackendUserAddress: Address | undefined;
  }
}

export const withAuth = (app: App, { auth, client }: TdkApiContext) => {
  app.decorateRequest("isAuthenticated", false);
  app.decorateRequest("authenticatedUserId", undefined);
  app.decorateRequest("authenticatedUserAddress", undefined);
  app.decorateRequest("authenticationError", undefined);
  app.decorateRequest("isBackendRequest", false);
  app.decorateRequest("verifiedBackendWallet", undefined);
  app.decorateRequest("verifiedBackendUserAddress", undefined);
  app.addHook("onRequest", async (req) => {
    // Check for explicit setting of user address and recover backend wallet address from signature
    if (req.headers["x-account-address"]) {
      const accountAddress = req.headers["x-account-address"].toString();
      if (!isAddress(accountAddress)) {
        throw createUnauthorizedError("Invalid account address");
      }

      const accountSignature = req.headers["x-account-signature"]?.toString();
      if (!isHex(accountSignature)) {
        throw createUnauthorizedError("Invalid account signature");
      }

      const expirationTime = Number(
        req.headers["x-account-signature-expiration"],
      );

      const backendWallet = await verifyAccountSignature({
        accountAddress,
        signature: accountSignature,
        expirationTime,
      });

      req.isBackendRequest = true;
      req.verifiedBackendWallet = backendWallet as Address;
      req.verifiedBackendUserAddress = accountAddress;
      Sentry.setUser({ username: req.verifiedBackendUserAddress });
      return;
    }

    // Check for explicit setting of backend wallet and recover address from signature
    if (req.headers["x-backend-wallet-signature"]) {
      const backendWallet = req.headers["x-backend-wallet"]?.toString();
      if (!backendWallet || !isAddress(backendWallet)) {
        throw createUnauthorizedError("Invalid backend wallet address");
      }

      const backendWalletSignature =
        req.headers["x-backend-wallet-signature"]?.toString();
      if (!isHex(backendWalletSignature)) {
        throw createUnauthorizedError("Invalid backend wallet signature");
      }

      const expirationTime = Number(
        req.headers["x-backend-wallet-signature-expiration"],
      );
      if (Number.isNaN(expirationTime)) {
        throw createUnauthorizedError(
          "Invalid backend wallet signature expiration",
        );
      }

      const verifiedBackendWallet = await verifyBackendWalletSignature({
        client,
        chainId: req.chain.id,
        backendWallet,
        signature: backendWalletSignature,
        expirationTime,
      });

      req.isBackendRequest = true;
      req.verifiedBackendWallet =
        verifiedBackendWallet.toLowerCase() as Address;
      return;
    }

    // Check for user address via JWT header
    if (req.headers.authorization) {
      try {
        const decoded = await auth.verifyJWT<UserContext>(
          req.headers.authorization.replace("Bearer ", ""),
        );
        const smartAccount = decoded.ctx.smartAccounts.find(
          (account) => account.chainId === req.chain.id,
        );
        req.isAuthenticated = true;
        req.authenticatedUserId = decoded.ctx.id;
        req.authenticatedUserAddress = (smartAccount?.address ??
          decoded.ctx.address ??
          decoded.sub) as Address;
        Sentry.setUser({
          id: req.authenticatedUserId,
          username: req.authenticatedUserAddress,
        });
      } catch (err) {
        req.authenticationError =
          err instanceof Error ? err.message : "Unknown error";
      }
    }
  });
};

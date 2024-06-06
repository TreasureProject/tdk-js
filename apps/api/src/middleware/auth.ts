import type { Prisma } from "@prisma/client";
import * as Sentry from "@sentry/node";
import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";
import { ThirdwebAuth } from "@thirdweb-dev/auth/fastify";
import type { AddressString } from "@treasure-dev/tdk-core";
import type { FastifyInstance } from "fastify";

import type { TdkApiContext } from "../types";
import { verifyAuth } from "../utils/auth";
import { fetchEmbeddedWalletUser } from "../utils/embeddedWalletApi";

declare module "fastify" {
  interface FastifyRequest {
    userAddress: AddressString | undefined;
    overrideUserAddress: AddressString | undefined;
    authError: string | undefined;
  }
}

export const withAuth = async (
  app: FastifyInstance,
  { env, db, auth, engine }: TdkApiContext,
) => {
  const { authRouter, authMiddleware } = ThirdwebAuth({
    domain: env.THIRDWEB_AUTH_DOMAIN,
    wallet: new PrivateKeyWallet(env.THIRDWEB_AUTH_PRIVATE_KEY),
    authOptions: {
      uri: `https://${env.THIRDWEB_AUTH_DOMAIN}`,
    },
    thirdwebAuthOptions: {
      secretKey: env.THIRDWEB_SECRET_KEY,
    },
    callbacks: {
      onLogin: async (smartAccountAddress, req) => {
        const user = await db.user.upsert({
          where: {
            smartAccountAddress,
          },
          update: {
            lastLoginAt: new Date(),
          },
          create: {
            smartAccountAddress,
          },
          select: {
            id: true,
            email: true,
            treasureTag: true,
          },
        });

        // User does not have an email address registered yet
        if (!user.email) {
          const {
            payload: {
              payload: { chain_id: chainId },
            },
          } = req.body as {
            payload: {
              payload: {
                chain_id: string;
              };
            };
          };

          // Get admin wallet associated with this smart account address
          const {
            result: [adminAddress],
          } = await engine.account.getAllAdmins(chainId, smartAccountAddress);

          // Look up any possible associated email addresses (for embedded wallets)
          const embeddedWalletUser = await fetchEmbeddedWalletUser(
            adminAddress,
            env.THIRDWEB_SECRET_KEY,
          );
          if (embeddedWalletUser) {
            const { email } = embeddedWalletUser;
            let updateData: Prisma.UserUpdateInput = { email };

            // Check if email was migrated from TreasureTag system, and delete existing record if so
            const existingUser = await db.user.findUnique({
              where: { email },
              select: { id: true },
            });
            if (existingUser) {
              updateData = {
                ...updateData,
                treasureTag: updateData.treasureTag,
              };
              await db.user.delete({ where: { id: existingUser.id } });
            }

            // Set user's email address
            const updatedUser = await db.user.update({
              where: {
                id: user.id,
              },
              data: updateData,
              select: {
                id: true,
                email: true,
                treasureTag: true,
              },
            });
            return updatedUser;
          }
        }

        // Return data to store in user's session
        return user;
      },
    },
  });

  // Now we add the auth router to our app to set up the necessary auth routes
  app.register(authRouter, { prefix: "/auth" });

  // We add the auth middleware to our app to let us access the user across our API
  app.register(authMiddleware);

  // Parse JWT header and obtain user address in middleware
  app.decorateRequest("userAddress", undefined);
  app.decorateRequest("overrideUserAddress", undefined);
  app.decorateRequest("authError", undefined);
  app.addHook("onRequest", async (req) => {
    if (req.headers.authorization) {
      const authResult = await verifyAuth(auth, req);
      if (authResult.valid) {
        req.userAddress = authResult.parsedJWT.sub as AddressString;
        Sentry.setUser({
          id: (authResult.parsedJWT.ctx as { id: string } | undefined)?.id,
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

import type { Prisma } from "@prisma/client";
import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";
import { ThirdwebAuth } from "@thirdweb-dev/auth/fastify";
import type { FastifyInstance } from "fastify";

import type { TdkApiContext } from "../types";
import { fetchEmbeddedWalletUser } from "../utils/embeddedWalletApi";

export let getUser: ReturnType<typeof ThirdwebAuth>["getUser"];

export const withAuth = async (
  app: FastifyInstance,
  { env, db, engine }: TdkApiContext,
) => {
  const {
    authRouter,
    authMiddleware,
    getUser: thirdwebGetUser,
  } = ThirdwebAuth({
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

  getUser = thirdwebGetUser;
};

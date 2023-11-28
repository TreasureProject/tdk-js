import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";
import { ThirdwebAuth } from "@thirdweb-dev/auth/fastify";
import type { FastifyInstance } from "fastify";

import { db } from "../utils/db";
import { env } from "../utils/env";

const { authRouter, authMiddleware, getUser } = ThirdwebAuth({
  domain: env.THIRDWEB_AUTH_DOMAIN,
  wallet: new PrivateKeyWallet(env.THIRDWEB_AUTH_PRIVATE_KEY),
  callbacks: {
    onLogin: async (address) => {
      const user = await db.user.upsert({
        where: {
          smartAccountAddress: address,
        },
        update: {
          lastLoginAt: new Date(),
        },
        create: {
          smartAccountAddress: address,
          lastLoginAt: new Date(),
        },
        select: {
          email: true,
          treasureTag: true,
        },
      });

      // Return data to store in user's session
      return user;
    },
  },
});

export const withAuth = async (app: FastifyInstance) => {
  // Now we add the auth router to our app to set up the necessary auth routes
  app.register(authRouter, { prefix: "/auth" });

  // We add the auth middleware to our app to let us access the user across our API
  app.register(authMiddleware);
};

export { getUser };

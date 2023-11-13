import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";
import { ThirdwebAuth } from "@thirdweb-dev/auth/fastify";
import type { FastifyInstance } from "fastify";

import { env } from "../utils/env";

const { authRouter, authMiddleware } = ThirdwebAuth({
  domain: env.THIRDWEB_AUTH_DOMAIN,
  wallet: new PrivateKeyWallet(env.THIRDWEB_AUTH_PRIVATE_KEY),
});

export const withAuth = async (app: FastifyInstance) => {
  // Now we add the auth router to our app to set up the necessary auth routes
  app.register(authRouter, { prefix: "/auth" });

  // We add the auth middleware to our app to let us access the user across our API
  app.register(authMiddleware);
};

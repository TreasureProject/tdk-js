import { getTreasureContractAddress } from "@treasure/tdk-core";
import type { FastifyPluginAsync } from "fastify";

import { baseReplySchema } from "../schemas/common";
import { loginBodySchema } from "../schemas/login";
import type { LoginBody } from "../types";
import { db } from "../utils/db";
import { engine } from "../utils/engine";
import { env } from "../utils/env";

export const loginRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: LoginBody }>(
    "/login",
    {
      schema: {
        body: loginBodySchema,
        response: {
          ...baseReplySchema,
        },
      },
    },
    async (request) => {
      const { project: slug, chainId, address: adminAddress } = request.body;
      const { backendWallet } = await db.project.findUniqueOrThrow({
        where: { slug },
        select: { backendWallet: true },
      });
      const {
        result: { deployedAddress },
      } = await engine.accountFactory.createAccount(
        chainId.toString(),
        getTreasureContractAddress(chainId, "TreasureLoginAccountFactory"),
        backendWallet || env.DEFAULT_BACKEND_WALLET,
        {
          adminAddress,
        },
      );
      return { address: deployedAddress };
    },
  );
};

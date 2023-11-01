import { type Static, Type } from "@sinclair/typebox";
import { getTreasureContractAddress } from "@treasure/core";
import type { FastifyPluginAsync } from "fastify";

import { db } from "../utils/db";
import { engine } from "../utils/engine";
import { env } from "../utils/env";
import {
  baseReplySchema,
  chainIdSchemaType,
  ethereumAddressSchemaType,
} from "../utils/schema";

const loginBodySchema = Type.Object({
  project: Type.String(),
  chainId: chainIdSchemaType,
  address: ethereumAddressSchemaType,
});

export const loginRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: Static<typeof loginBodySchema> }>(
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
      const project = await db.project.findUniqueOrThrow({ where: { slug } });
      const {
        result: { deployedAddress },
      } = await engine.accountFactory.createAccount(
        chainId.toString(),
        getTreasureContractAddress(chainId, "TreasureLoginAccountFactory"),
        project.backendWallet ?? env.DEFAULT_BACKEND_WALLET,
        {
          adminAddress,
        },
      );
      return { address: deployedAddress };
    },
  );
};

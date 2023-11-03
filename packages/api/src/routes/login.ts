import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { engine } from "../utils/engine";
import {
  baseReplySchema,
  chainIdSchema,
  ethereumAddressSchema,
} from "../utils/schema";

const loginHeadersSchema = Type.Object({
  "x-project-id": Type.String(),
  "x-chain-id": chainIdSchema,
});

const loginBodySchema = Type.Object({
  address: Type.String(),
});

const loginReplySchema = Type.Object({
  address: ethereumAddressSchema,
});

export type LoginHeaders = Static<typeof loginHeadersSchema>;
export type LoginBody = Static<typeof loginBodySchema>;
export type LoginReply = Static<typeof loginReplySchema>;

export const loginRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Headers: LoginHeaders; Body: LoginBody }>(
    "/login",
    {
      schema: {
        headers: loginHeadersSchema,
        body: loginBodySchema,
        response: {
          ...baseReplySchema,
          200: loginReplySchema,
        },
      },
    },
    async ({
      body: { address: adminAddress },
      chainId,
      accountFactory,
      backendWallet,
    }) => {
      const {
        result: { deployedAddress },
      } = await engine.accountFactory.createAccount(
        chainId.toString(),
        accountFactory,
        backendWallet,
        {
          adminAddress,
        },
      );
      return { address: deployedAddress };
    },
  );
};

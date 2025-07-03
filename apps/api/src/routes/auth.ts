import * as Sentry from "@sentry/node";
import { DEFAULT_TDK_CHAIN_ID, getUserSessions } from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";
import { defineChain } from "thirdweb";

import "../middleware/chain";
import "../middleware/swagger";
import {
  type ErrorReply,
  type LoginBody,
  type LoginReply,
  type ReadLoginPayloadQuerystring,
  type ReadLoginPayloadReply,
  loginBodySchema,
  loginReplySchema,
  readLoginPayloadQuerystringSchema,
  readLoginPayloadReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";

export const authRoutes =
  ({ thirdwebAuth, client }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Querystring: ReadLoginPayloadQuerystring;
      Reply: ReadLoginPayloadReply | ErrorReply;
    }>(
      "/login/payload",
      {
        schema: {
          summary: "Generate login payload",
          description: "Generate a login payload for a given wallet address",
          querystring: readLoginPayloadQuerystringSchema,
          response: {
            200: readLoginPayloadReplySchema,
          },
        },
      },
      async (req, reply) => {
        const payload = await thirdwebAuth.generatePayload({
          address: req.query.address,
          chainId: req.chain.id,
        });
        reply.send(payload);
      },
    );

    app.post<{ Body: LoginBody; Reply: LoginReply | ErrorReply }>(
      "/login",
      {
        schema: {
          summary: "Log in",
          description: "Log in with a signed payload",
          body: loginBodySchema,
          response: {
            200: loginReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          body: { payload: unverifiedPayload, signature },
        } = req;
        const verifyPayloadResult = await thirdwebAuth.verifyPayload({
          payload: unverifiedPayload,
          signature,
        });
        if (!verifyPayloadResult.valid) {
          return reply
            .code(400)
            .send({ error: `Login failed: ${verifyPayloadResult.error}` });
        }

        const verifiedPayload = verifyPayloadResult.payload;
        const chainId = Number(
          verifiedPayload.chain_id ?? DEFAULT_TDK_CHAIN_ID,
        );
        const address = verifiedPayload.address.toLowerCase();
        const chain = defineChain(chainId);

        Sentry.setUser({
          username: address,
        });

        const [authTokenResult, userSessionsResult] = await Promise.allSettled([
          thirdwebAuth.generateJWT({
            payload: verifiedPayload,
            context: {
              id: address,
              address,
              smartAccounts: [
                {
                  chainId: chain.id,
                  address,
                },
              ],
            },
          }),
          getUserSessions({
            client,
            chain: req.chain,
            address,
          }),
        ]);

        if (authTokenResult.status === "rejected") {
          throw authTokenResult.reason;
        }

        const userSessions =
          userSessionsResult.status === "fulfilled"
            ? userSessionsResult.value
            : [];
        const sessions = userSessions.map((session) => ({
          ...session,
          approvedTargets: session.approvedTargets.map((target) =>
            target.toLowerCase(),
          ),
          nativeTokenLimitPerTransaction:
            session.nativeTokenLimitPerTransaction.toString(),
          startTimestamp: session.startTimestamp.toString(),
          endTimestamp: session.endTimestamp.toString(),
        }));

        reply.send({
          token: authTokenResult.value,
          user: {
            address,
            sessions,
          },
        });
      },
    );
  };

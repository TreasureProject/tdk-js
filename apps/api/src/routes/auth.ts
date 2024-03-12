import { decodeAuthToken } from "@treasure/tdk-core";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/project";
import {
  type AuthVerifyBody,
  type AuthVerifyReply,
  type AuthenciateBody,
  type AuthenticateReply,
  type ErrorReply,
  authVerifyBodySchema,
  authVerifyReplySchema,
  authenticateBodySchema,
  authenticateReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { logInWithZeeverse, verifyZeeverseToken } from "../utils/zeeverse";

export const authRoutes =
  ({ env }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.post<{
      Body: AuthenciateBody;
      Reply: AuthenticateReply | ErrorReply;
    }>(
      "/auth/authenticate",
      {
        schema: {
          body: authenticateBodySchema,
          response: {
            200: authenticateReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { projectId } = req;
        let token: string | undefined;
        if (projectId === "zeeverse") {
          const {
            body: { email, password },
          } = req;
          token = (
            await logInWithZeeverse({
              apiUrl: env.ZEEVERSE_API_URL,
              email,
              password,
            })
          ).item.access_token;
        }

        if (!token) {
          return reply.code(401).send({ error: "Unauthorized" });
        }

        reply.send({
          projectId,
          token,
        });
      },
    );

    app.post<{ Body: AuthVerifyBody; Reply: AuthVerifyReply | ErrorReply }>(
      "/auth/verify",
      {
        schema: {
          body: authVerifyBodySchema,
          response: {
            200: authVerifyReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          body: { payload },
        } = req;
        const { projectId, token } = JSON.parse(payload) as AuthenticateReply;
        const result: AuthVerifyReply = {
          userId: "",
          email: "",
          exp: 0,
        };
        if (projectId === "zeeverse") {
          const { user } = await verifyZeeverseToken({
            apiUrl: env.ZEEVERSE_API_URL,
            token,
          });
          if (user.email_verified_at) {
            result.userId = user.id;
            result.email = user.email;
            result.exp = decodeAuthToken(token).exp;
          }
        }

        if (!result.userId || !result.email) {
          return reply.code(401).send({ error: "Unauthorized" });
        }

        return reply.send(result);
      },
    );
  };

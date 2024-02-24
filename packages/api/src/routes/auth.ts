import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { jwtDecode } from "jwt-decode";

import "../middleware/project";
import "../middleware/swagger";
import type { TdkApiContext } from "../types";
import type { ErrorReply } from "../utils/schema";
import { logInWithZeeverse, verifyZeeverseToken } from "../utils/zeeverse";

const authenticateBodySchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
});

const authenticateReplySchema = Type.Object({
  projectId: Type.String(),
  token: Type.String(),
});

const authVerifyBodySchema = Type.Object({
  payload: authenticateReplySchema,
});

const authVerifyReplySchema = Type.Object({
  userId: Type.String(),
  email: Type.String(),
  exp: Type.Optional(Type.Number()),
});

export type AuthenciateBody = Static<typeof authenticateBodySchema>;
export type AuthenticateReply = Static<typeof authenticateReplySchema>;

export type AuthVerifyBody = Static<typeof authVerifyBodySchema>;
export type AuthVerifyReply = Static<typeof authVerifyReplySchema>;

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
          body: {
            payload: { projectId, token },
          },
        } = req;
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
            result.exp = jwtDecode(token).exp;
          }
        }

        if (!result.userId || !result.email) {
          return reply.code(401).send({ error: "Unauthorized" });
        }

        return reply.send(result);
      },
    );
  };

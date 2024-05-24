import type { Prisma } from "@prisma/client";
import { DEFAULT_TDK_CHAIN_ID, decodeAuthToken } from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/project";
import "../middleware/swagger";
import type {
  LoginBody,
  LoginReply,
  ReadLoginPayloadQuerystring,
  ReadLoginPayloadReply,
} from "../schema";
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
  loginBodySchema,
  loginReplySchema,
  readLoginPayloadQuerystringSchema,
  readLoginPayloadReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { fetchEmbeddedWalletUser } from "../utils/embeddedWalletApi";
import { logInWithZeeverse, verifyZeeverseToken } from "../utils/zeeverse";

export const authRoutes =
  ({ env, auth, db, engine }: TdkApiContext): FastifyPluginAsync =>
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
        const payload = await auth.generatePayload({
          address: req.query.address,
          chainId: req.chainId,
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
        const verifiedPayload = await auth.verifyPayload(req.body);
        if (!verifiedPayload.valid) {
          return reply
            .code(400)
            .send({ error: `Login failed: ${verifiedPayload.error}` });
        }

        const smartAccountAddress = verifiedPayload.payload.address;
        let user = await db.user.upsert({
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
          // Get admin wallet associated with this smart account address
          const {
            result: [adminAddress],
          } = await engine.account.getAllAdmins(
            verifiedPayload.payload.chain_id ?? DEFAULT_TDK_CHAIN_ID.toString(),
            smartAccountAddress,
          );

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
            user = await db.user.update({
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
          }
        }

        // Add user data to JWT payload's context
        const authToken = await auth.generateJWT({
          payload: verifiedPayload.payload,
          context: user,
        });
        reply.send({ token: authToken });
      },
    );

    app.post<{
      Body: AuthenciateBody;
      Reply: AuthenticateReply | ErrorReply;
    }>(
      "/auth/authenticate",
      {
        schema: {
          summary: "Log in via third party",
          description: "Start login session with custom authentication method",
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
          summary: "Verify third-party login",
          description:
            "Verify login session started via custom authentication method",
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

import {
  DEFAULT_TDK_CHAIN_ID,
  getAllActiveSigners,
} from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/chain";
import "../middleware/swagger";
import type {
  LoginBody,
  LoginReply,
  ReadLoginPayloadQuerystring,
  ReadLoginPayloadReply,
} from "../schema";
import {
  type ErrorReply,
  loginBodySchema,
  loginReplySchema,
  readLoginPayloadQuerystringSchema,
  readLoginPayloadReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { fetchEmbeddedWalletUser } from "../utils/embeddedWalletApi";

export const authRoutes =
  ({ env, auth, db, engine, wagmiConfig }: TdkApiContext): FastifyPluginAsync =>
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

        const { payload } = verifiedPayload;
        const {
          chain_id: chainId = DEFAULT_TDK_CHAIN_ID.toString(),
          address: smartAccountAddress,
        } = payload;

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
            smartAccountAddress: true,
            email: true,
          },
        });

        // User does not have an email address registered yet
        if (!user.email) {
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

            // Check if email was migrated from TreasureTag system, and delete existing record if so
            const existingUser = await db.user.findUnique({
              where: { email },
              select: { id: true },
            });
            if (existingUser) {
              await db.user.delete({ where: { id: existingUser.id } });
            }

            // Set user's email address
            user = await db.user.update({
              where: {
                id: user.id,
              },
              data: { email },
              select: {
                id: true,
                smartAccountAddress: true,
                email: true,
              },
            });
          }
        }

        // Add user data to JWT payload's context
        const [authToken, allActiveSigners] = await Promise.all([
          auth.generateJWT({
            payload,
            context: user,
          }),
          getAllActiveSigners({
            chainId: Number(chainId),
            address: user.smartAccountAddress,
            wagmiConfig,
          }),
        ]);
        reply.send({
          token: authToken,
          user: {
            ...user,
            allActiveSigners: allActiveSigners.map((activeSigner) => ({
              ...activeSigner,
              approvedTargets: activeSigner.approvedTargets.map((target) =>
                target.toLowerCase(),
              ),
              nativeTokenLimitPerTransaction:
                activeSigner.nativeTokenLimitPerTransaction.toString(),
              startTimestamp: activeSigner.startTimestamp.toString(),
              endTimestamp: activeSigner.endTimestamp.toString(),
            })),
          },
        });
      },
    );
  };

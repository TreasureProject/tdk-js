import {
  DEFAULT_TDK_CHAIN_ID,
  type UserContext,
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
import { USER_SELECT_FIELDS } from "../utils/db";
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
        const { chain_id: chainId = DEFAULT_TDK_CHAIN_ID.toString(), address } =
          payload;

        let user = await db.user.upsert({
          where: {
            address,
          },
          update: {
            lastLoginAt: new Date(),
          },
          create: {
            address,
          },
          select: USER_SELECT_FIELDS,
        });

        // User is missing details we could fill in from the embedded wallet
        if (!user.email && !user.phoneNumber) {
          // Get admin wallet associated with this smart account address
          const {
            result: [adminAddress],
          } = await engine.account.getAllAdmins(chainId, address);

          // Look up any associated user details in the embedded wallet
          const embeddedWalletUser = await fetchEmbeddedWalletUser(
            adminAddress,
            env.THIRDWEB_SECRET_KEY,
          );
          if (embeddedWalletUser?.email || embeddedWalletUser?.phone) {
            user = await db.user.update({
              where: {
                id: user.id,
              },
              data: {
                email: embeddedWalletUser.email,
                phoneNumber: embeddedWalletUser.phone,
              },
              select: USER_SELECT_FIELDS,
            });
          }
        }

        const userContext: UserContext = {
          id: user.id,
          address: user.address,
          email: user.email,
          smartAccountAddress: user.address,
        };

        // Add user data to JWT payload's context
        const [authToken, allActiveSigners] = await Promise.all([
          auth.generateJWT({
            payload,
            context: userContext,
          }),
          getAllActiveSigners({
            chainId: Number(chainId),
            address: user.address,
            wagmiConfig,
          }),
        ]);
        reply.send({
          token: authToken,
          user: {
            ...userContext,
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

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
import { USER_PROFILE_SELECT_FIELDS, USER_SELECT_FIELDS } from "../utils/db";
import { fetchEmbeddedWalletUser } from "../utils/embeddedWalletApi";
import { transformUserProfileResponseFields } from "../utils/user";

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
          address: payloadAddress,
        } = payload;
        const address = payloadAddress.toLowerCase();

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
        if (!user.email) {
          let adminAddress: string | undefined;

          // Get admin wallet associated with this smart account address
          try {
            const { result } = await engine.account.getAllAdmins(
              chainId,
              address,
            );
            adminAddress = result[0];
          } catch {
            // Ignore lookup if this fails, address may not be a smart account if user connected with Web3 wallet
          }

          if (adminAddress) {
            // Look up any associated user details in the embedded wallet
            const embeddedWalletUser = await fetchEmbeddedWalletUser(
              adminAddress,
              env.THIRDWEB_SECRET_KEY,
            );
            if (embeddedWalletUser?.email) {
              user = await db.user.update({
                where: {
                  id: user.id,
                },
                data: {
                  email: embeddedWalletUser.email,
                },
                select: USER_SELECT_FIELDS,
              });
            }
          }
        }

        const userContext: UserContext = {
          id: user.id,
          address: user.address,
          email: user.email,
          smartAccountAddress: user.address,
        };

        // Add user data to JWT payload's context
        const [authToken, allActiveSigners, profile] = await Promise.all([
          auth.generateJWT({
            payload,
            context: userContext,
          }),
          getAllActiveSigners({
            chainId: Number(chainId),
            address: user.address,
            wagmiConfig,
          }),
          db.userProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id },
            select: USER_PROFILE_SELECT_FIELDS,
          }),
        ]);

        reply.send({
          token: authToken,
          user: {
            ...userContext,
            ...user,
            ...profile,
            ...transformUserProfileResponseFields(profile),
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

import {
  DEFAULT_TDK_CHAIN_ID,
  type UserContext,
  getUserSessions,
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
import { log } from "../utils/log";
import {
  getThirdwebUser,
  parseThirdwebUserEmail,
  transformUserProfileResponseFields,
} from "../utils/user";

export const authRoutes =
  ({
    auth,
    thirdwebAuth,
    db,
    env,
    client,
    engine,
  }: TdkApiContext): FastifyPluginAsync =>
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
        const verifiedPayload = await thirdwebAuth.verifyPayload(req.body);
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
            log.warn("Error fetching admin wallet for smart account:", address);
          }

          if (adminAddress) {
            const thirdwebUser = await getThirdwebUser({
              client,
              ecosystemId: env.THIRDWEB_ECOSYSTEM_ID,
              ecosystemPartnerId: env.THIRDWEB_ECOSYSTEM_PARTNER_ID,
              walletAddress: adminAddress,
            });
            if (thirdwebUser) {
              const email = parseThirdwebUserEmail(thirdwebUser);
              if (email) {
                user = await db.user.update({
                  where: {
                    id: user.id,
                  },
                  data: { email },
                  select: USER_SELECT_FIELDS,
                });
              }
            }
          }
        }

        const userContext: UserContext = {
          id: user.id,
          address: user.address,
          email: user.email,
          smartAccountAddress: user.address,
        };

        const [authTokenResult, userSessionsResult, profileResult] =
          await Promise.allSettled([
            auth.generateJWT(user.address, {
              issuer: payload.domain,
              issuedAt: new Date(payload.issued_at),
              expiresAt: new Date(payload.expiration_time),
              context: userContext,
            }),
            getUserSessions({
              client,
              chain: req.chain,
              address: user.address,
            }),
            db.userProfile.upsert({
              where: { userId: user.id },
              update: {},
              create: { userId: user.id },
              select: USER_PROFILE_SELECT_FIELDS,
            }),
          ]);

        if (authTokenResult.status === "rejected") {
          throw authTokenResult.reason;
        }

        if (profileResult.status === "rejected") {
          throw profileResult.reason;
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
            ...userContext,
            ...user,
            ...profileResult.value,
            ...transformUserProfileResponseFields(profileResult.value),
            sessions,
            // Fields for backwards compatibility
            allActiveSigners: sessions,
          },
        });
      },
    );
  };

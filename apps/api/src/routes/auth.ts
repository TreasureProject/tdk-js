import {
  DEFAULT_TDK_CHAIN_ID,
  type UserContext,
  getUserSessions,
} from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";
import { defineChain } from "thirdweb";
import { isZkSyncChain } from "thirdweb/utils";

import "../middleware/chain";
import "../middleware/swagger";
import {
  type ErrorReply,
  type LoginBody,
  type LoginCustomBody,
  type LoginCustomReply,
  type LoginReply,
  type ReadLoginPayloadQuerystring,
  type ReadLoginPayloadReply,
  loginBodySchema,
  loginCustomBodySchema,
  loginCustomReplySchema,
  loginReplySchema,
  readLoginPayloadQuerystringSchema,
  readLoginPayloadReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import {
  USER_PROFILE_SELECT_FIELDS,
  USER_SMART_ACCOUNT_INCLUDE_FIELDS,
} from "../utils/db";
import { throwUnauthorizedError } from "../utils/error";
import { log } from "../utils/log";
import {
  getThirdwebUser,
  parseThirdwebUserEmail,
  transformUserProfileResponseFields,
} from "../utils/user";
import { validateWanderersUser } from "../utils/wanderers";

type LoginCustomPayload = {
  wanderersCookie?: string;
  wanderersToken?: string;
};

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
        const chainId = Number(payload.chain_id ?? DEFAULT_TDK_CHAIN_ID);
        const address = payload.address.toLowerCase();
        const chain = defineChain(chainId);

        // Find user's smart account
        let userSmartAccount = await db.userSmartAccount.findUnique({
          where: {
            chainId_address: {
              chainId,
              address,
            },
          },
          include: USER_SMART_ACCOUNT_INCLUDE_FIELDS,
        });

        // If no smart account exists, fetch user details and create it
        if (!userSmartAccount) {
          let initialWalletAddress: string | undefined;

          // On ZKsync chains, the smart account address is the same as the admin wallet address
          if (await isZkSyncChain(chain)) {
            initialWalletAddress = address.toLowerCase();
          } else {
            // Fetch admin wallets associated with this smart account address
            const { result } = await engine.account.getAllAdmins(
              chainId.toString(),
              address,
            );
            initialWalletAddress = result[0]?.toLowerCase();
          }

          // Smart accounts should never be orphaned, but checking anyway
          if (!initialWalletAddress) {
            throwUnauthorizedError("No admin wallet found for smart account");
            return;
          }

          // Fetch Thirdweb user details in case the initial wallet address is an ecosystem wallet
          const thirdwebUser = await getThirdwebUser({
            client,
            ecosystemId: env.THIRDWEB_ECOSYSTEM_ID,
            ecosystemPartnerId: env.THIRDWEB_ECOSYSTEM_PARTNER_ID,
            walletAddress: initialWalletAddress,
          });
          const initialEmail = thirdwebUser
            ? parseThirdwebUserEmail(thirdwebUser)
            : undefined;

          const userData = thirdwebUser?.userId
            ? {
                externalUserId: thirdwebUser.userId,
              }
            : {
                externalWalletAddress: initialWalletAddress,
              };

          userSmartAccount = await db.userSmartAccount.create({
            data: {
              chainId,
              address,
              initialEmail,
              initialWalletAddress,
              user: {
                connectOrCreate: {
                  where: userData,
                  create: userData,
                },
              },
            },
            include: USER_SMART_ACCOUNT_INCLUDE_FIELDS,
          });
        }

        const { user } = userSmartAccount;
        const profile = await db.userProfile.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            email: userSmartAccount.initialEmail,
          },
          select: USER_PROFILE_SELECT_FIELDS,
        });

        const [authTokenResult, userSessionsResult] = await Promise.allSettled([
          auth.generateJWT<UserContext>(address, {
            issuer: payload.domain,
            issuedAt: new Date(payload.issued_at),
            expiresAt: new Date(payload.expiration_time),
            context: {
              id: user.id,
              email: profile.email,
              externalWalletAddress: user.externalWalletAddress,
              tag: profile.tag,
              discriminant: profile.discriminant,
              smartAccounts: user.smartAccounts,
              // Keep previous field name for backwards compatibility
              address,
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
            ...user,
            ...profile,
            ...transformUserProfileResponseFields(profile),
            sessions,
            // Keep previous field name for backwards compatibility
            address,
          },
        });
      },
    );

    app.post<{ Body: LoginCustomBody; Reply: LoginCustomReply | ErrorReply }>(
      "/login/custom",
      {
        schema: {
          summary: "Log in with custom auth",
          description: "Log in with a custom auth payload",
          body: loginCustomBodySchema,
          response: {
            200: loginCustomReplySchema,
          },
        },
      },
      async (req, reply) => {
        let payload: LoginCustomPayload | undefined;

        try {
          payload = JSON.parse(req.body.payload);
        } catch (err) {
          log.error("Error parsing custom login payload:", err);
        }

        if (payload?.wanderersCookie || payload?.wanderersToken) {
          const user = await validateWanderersUser(
            payload.wanderersCookie,
            payload.wanderersToken,
          );
          return reply.send(user);
        }

        throwUnauthorizedError("Invalid request");
      },
    );
  };

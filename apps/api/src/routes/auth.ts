import * as Sentry from "@sentry/node";
import {
  DEFAULT_TDK_CHAIN_ID,
  type UserContext,
  getUserSessions,
} from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";
import { type GetUserResult, defineChain } from "thirdweb";
import { isZkSyncChain } from "thirdweb/utils";
import { v4 as uuidv4 } from "uuid";

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
  USER_NOTIFICATION_SETTINGS_SELECT_FIELDS,
  USER_PROFILE_SELECT_FIELDS,
  USER_SELECT_FIELDS,
  USER_SMART_ACCOUNT_SELECT_FIELDS,
  USER_SOCIAL_ACCOUNT_SELECT_FIELDS,
} from "../utils/db";
import {
  createUnauthorizedError,
  createUserNotFoundError,
} from "../utils/error";
import { log } from "../utils/log";
import {
  migrateLegacyUser,
  parseThirdwebUserLinkedAccounts,
  transformUserProfileResponseFields,
} from "../utils/user";
import { validateWanderersUser } from "../utils/wanderers";

type LoginCustomPayload = {
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
    getThirdwebUser,
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
        const {
          body: {
            payload: unverifiedPayload,
            signature,
            adminAccount: adminAccountData,
            authTokenDurationSec = 86_400, // 1 day
          },
        } = req;
        const [verifyPayloadResult, verifyAdminAccountPayloadResult] =
          await Promise.all([
            thirdwebAuth.verifyPayload({
              payload: unverifiedPayload,
              signature,
            }),
            adminAccountData
              ? thirdwebAuth.verifyPayload({
                  payload: adminAccountData.payload,
                  signature: adminAccountData.signature,
                })
              : undefined,
          ]);
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

        const foundUserSmartAccount = await db.userSmartAccount.findUnique({
          where: {
            chainId_address: {
              chainId,
              address,
            },
          },
        });

        let userId: string;
        let thirdwebUser: GetUserResult | null;
        if (foundUserSmartAccount) {
          const thirdwebUserDetails = await getThirdwebUser({
            ecosystemWalletAddress:
              foundUserSmartAccount.ecosystemWalletAddress,
          });

          // TODO: switch to throwing an error when Thirdweb issues are resolved
          if (!thirdwebUserDetails) {
            console.warn(
              `No user details found for ecosystem wallet ${foundUserSmartAccount.ecosystemWalletAddress}`,
            );
          }

          userId = foundUserSmartAccount.userId;
          thirdwebUser = thirdwebUserDetails;
        } else {
          let adminWalletAddress: string | undefined;

          // On ZKsync chains, the smart account address is the same as the admin wallet address
          if (await isZkSyncChain(chain)) {
            adminWalletAddress = address.toLowerCase();
          } else if (verifyAdminAccountPayloadResult?.valid) {
            adminWalletAddress =
              verifyAdminAccountPayloadResult.payload.address;
          } else {
            try {
              // Fetch admin wallets associated with this smart account address
              const { result } = await engine.account.getAllAdmins(
                chainId.toString(),
                address,
              );
              adminWalletAddress = result[0]?.toLowerCase();
            } catch (err) {
              log.error(`Error fetching admin wallets: ${err}`);
            }
          }

          // Smart accounts should never be orphaned, but checking anyway
          if (!adminWalletAddress) {
            throw createUnauthorizedError(
              "No admin wallet found for smart account",
            );
          }

          // Fetch Thirdweb user details by ecosystem wallet address
          const thirdwebUserDetails = await getThirdwebUser({
            ecosystemWalletAddress: adminWalletAddress,
          });

          // TODO: switch to throwing an error when Thirdweb issues are resolved
          if (!thirdwebUserDetails) {
            console.warn(
              `No user details found for admin wallet ${adminWalletAddress}`,
            );
          }

          const externalUserId =
            thirdwebUserDetails?.userId ?? `temp-${uuidv4()}`;

          const newUserSmartAccount = await db.userSmartAccount.create({
            data: {
              chainId,
              address,
              ecosystemWalletAddress: adminWalletAddress,
              // Look for existing user to connect, otherwise create a new user
              user: {
                connectOrCreate: {
                  where: {
                    externalUserId,
                  },
                  create: {
                    externalUserId,
                  },
                },
              },
            },
          });

          userId = newUserSmartAccount.userId;
          thirdwebUser = thirdwebUserDetails;
        }

        Sentry.setUser({
          id: userId,
          username: address,
        });

        const { emailAddresses, externalWalletAddresses } =
          parseThirdwebUserLinkedAccounts(thirdwebUser);
        const [user, profile, legacyProfiles] = await Promise.all([
          // Fetch user
          db.user.findUnique({
            where: { id: userId },
            select: {
              ...USER_SELECT_FIELDS,
              smartAccounts: {
                select: USER_SMART_ACCOUNT_SELECT_FIELDS,
              },
              socialAccounts: {
                select: USER_SOCIAL_ACCOUNT_SELECT_FIELDS,
              },
              notificationSettings: {
                select: USER_NOTIFICATION_SETTINGS_SELECT_FIELDS,
              },
            },
          }),
          // Fetch or create user profile
          db.userProfile.upsert({
            where: { userId: userId },
            update: {},
            create: {
              userId: userId,
              email: emailAddresses[0],
            },
            select: USER_PROFILE_SELECT_FIELDS,
          }),
          // Detect any migrations related to this user
          emailAddresses[0]
            ? db.userProfile.findMany({
                where: {
                  legacyEmail: emailAddresses[0],
                  legacyEmailVerifiedAt: { not: null },
                  // Skip already-migrated profiles
                  legacyProfileMigratedAt: null,
                },
              })
            : externalWalletAddresses[0]
              ? db.userProfile.findMany({
                  where: {
                    legacyAddress: externalWalletAddresses[0],
                    // Skip already-migrated profiles
                    legacyProfileMigratedAt: null,
                  },
                })
              : [],
        ]);

        if (!user) {
          throw createUserNotFoundError();
        }

        const [authTokenResult, userSessionsResult] = await Promise.allSettled([
          auth.generateJWT<UserContext>(address, {
            issuer: verifiedPayload.domain,
            issuedAt: new Date(),
            expiresAt: new Date(
              new Date().getTime() + authTokenDurationSec * 1000,
            ),
            context: {
              id: user.id,
              email: profile.email,
              address,
              tag: profile.tag,
              discriminant: profile.discriminant,
              smartAccounts: user.smartAccounts,
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

        let updatedProfile: typeof profile | undefined;

        if (env.USER_MIGRATION_ENABLED) {
          // Automatically migrate legacy profile if only one exists
          if (legacyProfiles.length === 1 && !!legacyProfiles[0]) {
            const result = await migrateLegacyUser({
              db,
              userId: user.id,
              userProfileId: profile.id,
              legacyProfile: legacyProfiles[0],
            });
            updatedProfile = result.updatedProfile;
          }
        }

        const finalProfile = updatedProfile ?? profile;
        reply.send({
          token: authTokenResult.value,
          user: {
            ...user,
            ...finalProfile,
            ...transformUserProfileResponseFields(finalProfile),
            address,
            sessions,
            externalWalletAddresses,
          },
          legacyProfiles:
            // Include the legacy profiles if a legacy migration has not occurred.
            env.USER_MIGRATION_ENABLED &&
            legacyProfiles.length > 1 &&
            !finalProfile.legacyProfileMigratedAt
              ? legacyProfiles
              : [],
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

        if (env.WANDERERS_JWKS_URI && payload?.wanderersToken) {
          const user = await validateWanderersUser({
            jwksUri: env.WANDERERS_JWKS_URI,
            token: payload.wanderersToken,
          });
          return reply.send(user);
        }

        throw createUnauthorizedError("Invalid request");
      },
    );
  };

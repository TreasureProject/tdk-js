import { getAllActiveSigners } from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/auth";
import "../middleware/chain";
import "../middleware/swagger";
import {
  type ErrorReply,
  type ReadCurrentUserReply,
  type ReadCurrentUserSessionsQuerystring,
  type ReadCurrentUserInventoryQuerystring,
  type ReadCurrentUserSessionsReply,
  type ReadCurrentUserInventoryReply,
  type UpdateCurrentUserBody,
  type UpdateCurrentUserReply,
  readCurrentUserReplySchema,
  readCurrentUserSessionsReplySchema,
  readCurrentUserInventoryReplySchema,
  updateCurrentUserBodySchema,
  updateCurrentUserReplySchema,
  readCurrentUserInventoryQuerystringSchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { USER_PROFILE_SELECT_FIELDS, USER_SELECT_FIELDS } from "../utils/db";
import { TDK_ERROR_CODES, TDK_ERROR_NAMES, TdkError } from "../utils/error";
import { transformUserProfileResponseFields } from "../utils/user";

export const usersRoutes =
  ({ env, db, wagmiConfig }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Reply: ReadCurrentUserReply | ErrorReply;
    }>(
      "/users/me",
      {
        schema: {
          summary: "Get user",
          description: "Get current user profile details",
          security: [{ authToken: [] }],
          response: {
            200: readCurrentUserReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { chainId, userId, userAddress, authError } = req;
        if (!userId || !userAddress) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.AuthError,
            code: TDK_ERROR_CODES.AUTH_UNAUTHORIZED,
            message: "Unauthorized",
            data: { authError },
          });
        }

        const [profile, allActiveSigners] = await Promise.all([
          db.userProfile.upsert({
            where: { userId },
            update: {},
            create: { userId },
            select: {
              ...USER_PROFILE_SELECT_FIELDS,
              user: {
                select: USER_SELECT_FIELDS,
              },
            },
          }),
          getAllActiveSigners({
            chainId,
            address: userAddress,
            wagmiConfig,
          }),
        ]);

        if (!profile.user) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.UserError,
            code: TDK_ERROR_CODES.USER_NOT_FOUND,
            message: "User not found",
          });
        }

        const { user, ...restProfile } = profile;

        reply.send({
          ...user,
          ...restProfile,
          ...transformUserProfileResponseFields(restProfile),
          smartAccountAddress: user.address,
          allActiveSigners: allActiveSigners.map((activeSigner) => ({
            ...activeSigner,
            approvedTargets: activeSigner.approvedTargets.map((target) =>
              target.toLowerCase()
            ),
            nativeTokenLimitPerTransaction:
              activeSigner.nativeTokenLimitPerTransaction.toString(),
            startTimestamp: activeSigner.startTimestamp.toString(),
            endTimestamp: activeSigner.endTimestamp.toString(),
          })),
        });
      }
    );

    app.put<{
      Body: UpdateCurrentUserBody;
      Reply: UpdateCurrentUserReply | ErrorReply;
    }>(
      "/users/me",
      {
        schema: {
          summary: "Update user",
          description: "Update current user profile details",
          security: [{ authToken: [] }],
          body: updateCurrentUserBodySchema,
          response: {
            200: updateCurrentUserReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { userId, authError } = req;
        if (!userId) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.AuthError,
            code: TDK_ERROR_CODES.AUTH_UNAUTHORIZED,
            message: "Unauthorized",
            data: { authError },
          });
        }

        const {
          emailSecurityPhrase,
          featuredNftIds,
          featuredBadgeIds,
          highlyFeaturedBadgeId,
          about,
          pfp,
          banner,
          showMagicBalance,
          showEthBalance,
          showGemsBalance,
        } = req.body;

        const emailSecurityPhraseUpdatedAt =
          typeof emailSecurityPhrase !== "undefined" ? new Date() : undefined;

        const profile = await db.userProfile.upsert({
          where: { userId },
          update: {
            emailSecurityPhrase,
            emailSecurityPhraseUpdatedAt,
            featuredNftIds,
            featuredBadgeIds,
            highlyFeaturedBadgeId,
            about,
            pfp,
            banner,
            showMagicBalance,
            showEthBalance,
            showGemsBalance,
          },
          create: { userId },
          select: {
            ...USER_PROFILE_SELECT_FIELDS,
            user: {
              select: USER_SELECT_FIELDS,
            },
          },
        });

        if (!profile.user) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.UserError,
            code: TDK_ERROR_CODES.USER_NOT_FOUND,
            message: "User not found",
          });
        }

        const { user, ...restProfile } = profile;

        reply.send({
          ...user,
          ...restProfile,
          ...transformUserProfileResponseFields(restProfile),
          smartAccountAddress: user.address,
        });
      }
    );

    app.get<{
      Querystring: ReadCurrentUserSessionsQuerystring;
      Reply: ReadCurrentUserSessionsReply | ErrorReply;
    }>(
      "/users/me/sessions",
      {
        schema: {
          summary: "Get user sessions",
          description: "Get current user's on-chain sessions",
          security: [{ authToken: [] }],
          response: {
            200: readCurrentUserSessionsReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { userAddress, authError } = req;
        if (!userAddress) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.AuthError,
            code: TDK_ERROR_CODES.AUTH_UNAUTHORIZED,
            message: "Unauthorized",
            data: { authError },
          });
        }

        const allActiveSigners = await getAllActiveSigners({
          chainId: Number(req.query.chainId),
          address: userAddress,
          wagmiConfig,
        });

        reply.send(
          allActiveSigners.map((activeSigner) => ({
            ...activeSigner,
            approvedTargets: activeSigner.approvedTargets.map((target) =>
              target.toLowerCase()
            ),
            nativeTokenLimitPerTransaction:
              activeSigner.nativeTokenLimitPerTransaction.toString(),
            startTimestamp: activeSigner.startTimestamp.toString(),
            endTimestamp: activeSigner.endTimestamp.toString(),
          }))
        );
      }
    );
    app.get<{
      Querystring: ReadCurrentUserInventoryQuerystring;
      Reply: ReadCurrentUserInventoryReply | ErrorReply;
    }>(
      "/users/me/inventory",
      {
        schema: {
          summary: "Get user inventory",
          description: "Get current user's NFTs",
          security: [{ authToken: [] }],
          headers: {
            type: "object",
            properties: {
              "x-api-key": {
                type: "string",
                description: "API key for authentication",
              },
            },
            required: ["x-api-key"],
          },
          querystring: {
            type: "object",
            properties: {
              userAddress: {
                type: "string",
                description: "The target user address to fetch tokens for",
              },
              chains: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["arb", "ruby", "eth"],
                },
                description:
                  "Chains to query Tokesn from. Can also be a comma separated list",
              },
              collectionStatus: {
                type: "string",
                enum: ["REGISTERED", "UNREGISTERED"],
                description: "Collection Status",
              },
              slugs: {
                type: "array",
                items: {
                  type: "string",
                },
                description:
                  "Filter Tokens by slugs. Can also be a comma separated list",
              },
              ids: {
                type: "array",
                items: { type: "string" },
                description: "Filter specific Token IDs",
              },
              traits: {
                type: "array",
                items: {
                  type: "string",
                },
                description:
                  "Filter Tokens by traits. Can also be a comma separated list",
              },
              projection: {
                type: "string",
                description:
                  "Comma separated string of properties to project from results",
              },
              textSearch: {
                type: "string",
                description: "Text to search User Tokens by",
              },
              showHiddenTraits: {
                type: "boolean",
                description: "Are hidden traits shown in the results",
              },
              showHiddenTags: {
                type: "boolean",
                description: "Are hidden tags shown in the results",
              },
            },
          },
          response: {
            200: readCurrentUserInventoryReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          userAddress,
          chains,
          collectionStatus,
          slugs,
          ids,
          traits,
          projection,
          textSearch,
          query,
          showHiddenTraits,
          showHiddenTags,
        } = req.query;
        const { "x-api-key": apiKey } = req.headers;
        if (!apiKey || typeof apiKey !== "string") {
          throw new Error(`Error fetching user inventory: missing x-api-key`);
        }
        const { TROVE_API_URL: apiUrl } = env;
        const url = new URL(`${apiUrl}/tokens-for-user`);
        url.searchParams.append("userAddress", userAddress);
        if (!userAddress) {
          throw new Error(`Error fetching user inventory: missing userAddress`);
        }

        if (chains) {
          if (Array.isArray(chains)) {
            url.searchParams.append("chains", chains.join(","));
          } else {
            url.searchParams.append("chains", chains);
          }
        }
        if (collectionStatus) {
          url.searchParams.append("collectionStatus", collectionStatus);
        }
        if (slugs) {
          if (Array.isArray(slugs)) {
            url.searchParams.append("slugs", slugs.join(","));
          } else {
            url.searchParams.append("slugs", slugs);
          }
        }
        if (ids) {
          if (Array.isArray(ids)) {
            url.searchParams.append("ids", ids.join(","));
          } else {
            url.searchParams.append("ids", ids);
          }
        }
        if (traits) {
          if (Array.isArray(traits)) {
            url.searchParams.append("traits", traits.join(","));
          } else {
            url.searchParams.append("traits", traits);
          }
        }
        if (projection) {
          url.searchParams.append("projection", projection);
        }
        if (textSearch) {
          url.searchParams.append("textSearch", textSearch);
        }
        if (query) {
          url.searchParams.append("query", query);
        }
        if (showHiddenTraits !== undefined) {
          url.searchParams.append(
            "showHiddenTraits",
            showHiddenTraits ? "true" : "false"
          );
        }
        if (showHiddenTags !== undefined) {
          url.searchParams.append(
            "showHiddenTags",
            showHiddenTags ? "true" : "false"
          );
        }

        const response = await fetch(url, {
          headers: {
            "X-API-Key": apiKey,
          },
        });
        const results = await response.json();
        if (!Array.isArray(results)) {
          throw new Error(
            `Error fetching user inventory: ${
              results?.message ?? results?.errorMessage ?? "Unknown error"
            }`
          );
        }

        reply.send(results);
      }
    );
  };

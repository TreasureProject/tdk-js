import type { FastifyPluginAsync } from "fastify";

import type { ErrorReply } from "../schema";
import {
  type ValidateBody,
  type ValidateParams,
  type ValidateReply,
  validateBodySchema,
  validateReplySchema,
} from "../schema/gas-sponsorship";
import type { TdkApiContext } from "../types";

// TODO: Replace with actual sponsored partner IDs or logic to fetch them from another service like TMC
const fullySponsoredPatnerIds = new Set(["zeeverse", "smols"]);

export const gasSponsorshipRoutes =
  ({ db }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.post<{
      Params: ValidateParams;
      Body: ValidateBody;
      Reply: ValidateReply | ErrorReply;
    }>(
      "/gas-sponsorship/:partnerId/validate",
      {
        schema: {
          body: validateBodySchema,
          response: {
            200: validateReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { body, params } = req;

        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const last24hTransactions = await db.transaction.count({
          where: {
            fromAddress: body.userOp.sender,
            blockTimestamp: {
              gte: yesterday,
            },
          },
        });

        const [isPartnerFullySponsored, hasLessThan10Transactions] = [
          fullySponsoredPatnerIds.has(params.partnerId),
          last24hTransactions < 10,
        ];

        let reason = "does not meet the criteria";

        switch (true) {
          case isPartnerFullySponsored:
            reason = "partner is fully sponsored";
            break;
          case hasLessThan10Transactions:
            reason = "less than 10 transactions in the last 24 hours";
            break;

          default:
            break;
        }

        const isAllowed = isPartnerFullySponsored || hasLessThan10Transactions;

        reply.send({
          isAllowed,
          reason,
        });
      },
    );
  };

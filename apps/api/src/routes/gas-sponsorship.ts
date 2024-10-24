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

// TODO: tweak data here based on final resolutions.
// TODO: move this to the DB so it can be updated without code changes (through some sort of dashboard)
const sponsorshipRules = {
  partner: {
    fullySponsoredIds: ["zeeverse", "smols"],
  },
  user: {
    maxTransactionsPerMonth: 100,
    maxGasPerMonth: 0,
  },
};

const validateRules = ({
  partnerId,
  monthlyTransactions,
  monthlyGas,
}: {
  partnerId: string;
  monthlyTransactions: number;
  monthlyGas: number;
}) => {
  const { partner, user } = sponsorshipRules;

  const isPartnerFullySponsored = partner.fullySponsoredIds.includes(partnerId);
  const hasExceededTransactions =
    monthlyTransactions > user.maxTransactionsPerMonth;
  const hasExceededGas = monthlyGas > user.maxGasPerMonth;

  let reason = "does not meet the criteria";

  switch (true) {
    case isPartnerFullySponsored:
      reason = "partner is fully sponsored";
      break;
    case hasExceededTransactions:
      reason = "exceeded the maximum number of transactions per month";
      break;
    case hasExceededGas:
      reason = "exceeded the maximum gas per month";
      break;

    default:
      break;
  }

  const isAllowed =
    isPartnerFullySponsored || !hasExceededTransactions || !hasExceededGas;

  return {
    isAllowed,
    reason,
  };
};

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

        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const last24hTransactions = await db.transaction.count({
          where: {
            fromAddress: body.userOp.sender,
            blockTimestamp: {
              gte: oneMonthAgo,
            },
          },
        });

        const { isAllowed, reason } = validateRules({
          partnerId: params.partnerId,
          monthlyTransactions: last24hTransactions,
          monthlyGas: 1, // TODO: calculate the total gas used in the last 24 hours
        });

        reply.send({
          isAllowed,
          reason,
        });
      },
    );
  };

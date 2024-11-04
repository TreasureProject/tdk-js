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
import { validateSegmentationRules } from "../utils/segmentation";

export const partnersRoutes =
  ({ db }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.post<{
      Params: ValidateParams;
      Body: ValidateBody;
      Reply: ValidateReply | ErrorReply;
    }>(
      "/partners/:partnerId/gas-sponsorship",
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

        const lastMonthTransactions = await db.transaction.count({
          where: {
            fromAddress: body.userOp.sender,
            blockTimestamp: {
              gte: oneMonthAgo,
            },
          },
        });

        const {
          _sum: { gas: lastMonthGasRaw },
        } = await db.transaction.aggregate({
          where: {
            fromAddress: body.userOp.sender,
            blockTimestamp: {
              gte: oneMonthAgo,
            },
          },
          _sum: {
            gas: true,
          },
        });

        const lastMonthGas =
          lastMonthGasRaw?.toNumber() ?? Number.MAX_SAFE_INTEGER;

        const { isAllowed, reason } = validateSegmentationRules(
          {
            partner: {
              ids: ["zeeverse", "smols"],
            },
            user: {
              maxTransactions: 100,
              maxGas: 1000,
            },
          },
          {
            partner: { id: params.partnerId },
            user: {
              transactionsCount: lastMonthTransactions,
              gas: lastMonthGas,
            },
          },
        );

        reply.send({
          isAllowed,
          reason,
        });
      },
    );
  };

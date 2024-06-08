import type { FastifyInstance } from "fastify";

export const withErrorHandler = async (app: FastifyInstance) =>
  app.setErrorHandler((err, _, reply) => {
    reply.code(err.statusCode ?? 500).send({ ...err, error: err.message });
  });

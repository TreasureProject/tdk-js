import type { FastifyInstance } from "fastify";

export const withErrorHandler = async (app: FastifyInstance) =>
  app.setErrorHandler((err, req, reply) => {
    reply.code(err.statusCode ?? 500).send({ error: err.message });
  });

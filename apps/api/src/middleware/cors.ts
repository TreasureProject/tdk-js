import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

export const withCors = async (app: FastifyInstance) => {
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
};

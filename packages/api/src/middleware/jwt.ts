import jwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";

import { env } from "../utils/env";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { address: string };
  }
}

export const withJwt = async (app: FastifyInstance) =>
  app.register(jwt, {
    secret: env.JWT_SECRET,
  });

import cors from "@fastify/cors";

import type { App } from "../utils/app";

export const withCors = (app: App) =>
  app.register(cors, {
    origin: true,
    credentials: true,
  });

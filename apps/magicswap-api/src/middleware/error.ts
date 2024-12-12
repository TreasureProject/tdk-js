import type { App } from "../utils/app";

export const withErrorHandler = (app: App) =>
  app.setErrorHandler((err, _, reply) => {
    reply.code(err.statusCode ?? 500).send({ ...err, error: err.message });
  });

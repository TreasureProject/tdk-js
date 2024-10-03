import * as Sentry from "@sentry/node";

const environment = process.env.SENTRY_ENVIRONMENT || "production";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment,
  sampleRate: environment === "development" ? 1 : 0.75,
  ignoreErrors: ["Unauthorized", "401 Unauthorized", "404 Not Found"],
});

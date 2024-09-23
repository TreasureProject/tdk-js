import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const environment = process.env.SENTRY_ENVIRONMENT || "production";
const isDevelopment = environment === "development";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment,
  integrations: [nodeProfilingIntegration(), Sentry.prismaIntegration()],
  sampleRate: isDevelopment ? 1 : 0.8,
  // instrumentation fails when included: https://github.com/getsentry/sentry-javascript/issues/13662
  // tracesSampleRate: isDevelopment ? 1 : 0.6,
  profilesSampleRate: isDevelopment ? 1 : 0.6,
});

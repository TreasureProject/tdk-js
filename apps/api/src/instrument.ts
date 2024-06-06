import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || "production",
  integrations: [nodeProfilingIntegration(), Sentry.prismaIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

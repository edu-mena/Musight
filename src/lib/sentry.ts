import * as Sentry from "@sentry/react";
import { env } from "./env";

export function initSentry() {
  if (!import.meta.env.PROD || !env.VITE_SENTRY_DSN) return;

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

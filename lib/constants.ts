export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

// Enable telemetry in production OR when OTEL_EXPORTER_OTLP_ENDPOINT is configured
// This allows telemetry in local Kubernetes deployments with the OTEL collector
export const isTelemetryEnabled =
  isProductionEnvironment || Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT);

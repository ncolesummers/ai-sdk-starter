import { registerOTel } from "@vercel/otel";

export async function register() {
  // Service name can be overridden by OTEL_SERVICE_NAME env var
  const serviceName = process.env.OTEL_SERVICE_NAME || "ai-chatbot";

  // OTEL_EXPORTER_OTLP_ENDPOINT is set in k8s/app.yaml for Kubernetes deployments
  // It points to the OpenTelemetry Collector service
  registerOTel({ serviceName });
  // Register graceful shutdown handlers for SIGTERM and SIGINT
  // Only in Node.js runtime (not Edge) - use dynamic import to avoid Edge Runtime errors
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerShutdownHandlers } = await import("./lib/shutdown");
    registerShutdownHandlers();
  }
}

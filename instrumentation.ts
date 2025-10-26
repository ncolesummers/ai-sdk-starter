import { registerOTel } from "@vercel/otel";

export function register() {
  // Service name can be overridden by OTEL_SERVICE_NAME env var
  const serviceName = process.env.OTEL_SERVICE_NAME || "ai-chatbot";

  // OTEL_EXPORTER_OTLP_ENDPOINT is set in k8s/app.yaml for Kubernetes deployments
  // It points to the OpenTelemetry Collector service
  registerOTel({ serviceName });
}

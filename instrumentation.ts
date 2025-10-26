import { registerOTel } from "@vercel/otel";
import { validateModels } from "./lib/ai/validate-models";

export async function register() {
  // Service name can be overridden by OTEL_SERVICE_NAME env var
  const serviceName = process.env.OTEL_SERVICE_NAME || "ai-chatbot";

  // OTEL_EXPORTER_OTLP_ENDPOINT is set in k8s/app.yaml for Kubernetes deployments
  // It points to the OpenTelemetry Collector service
  registerOTel({ serviceName });

  // Validate that all configured models exist in Ollama
  // This will fail fast in production if models are missing
  await validateModels();
}

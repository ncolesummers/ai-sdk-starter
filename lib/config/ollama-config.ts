import "server-only";

import { eq } from "drizzle-orm";
import { db } from "../db/queries";
import { config } from "../db/schema";
import { createLogger } from "../logger";

const logger = createLogger("ollama-config");

// Configuration keys
const OLLAMA_URL_KEY = "ollama_base_url";
const OLLAMA_MODELS_KEY = "ollama_models_config";
const OLLAMA_API_FORMAT_KEY = "ollama_api_format";

// API format types
export type OllamaApiFormat = "native" | "openai";

// Model configuration interface
export type ModelConfig = {
  id: string;
  displayName: string;
  enabled: boolean;
  isDefault: boolean;
  reasoning: boolean;
};

// Native Ollama API model response (/api/tags)
export type OllamaNativeModel = {
  name: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
};

// OpenAI-compatible API model response (/v1/models)
export type OllamaOpenAIModel = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
};

// Union type for model responses
export type OllamaModel = OllamaNativeModel | OllamaOpenAIModel;

/**
 * Get the Ollama base URL
 * Falls back to environment variable if not configured
 */
export async function getOllamaBaseUrl(): Promise<string> {
  const result = await db
    .select()
    .from(config)
    .where(eq(config.key, OLLAMA_URL_KEY))
    .limit(1);

  const configuredUrl = result[0]?.value as string | null;
  return (
    configuredUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434"
  );
}

/**
 * Get the Ollama API format
 * Defaults to 'native' for new installations
 */
export async function getOllamaApiFormat(): Promise<OllamaApiFormat> {
  const result = await db
    .select()
    .from(config)
    .where(eq(config.key, OLLAMA_API_FORMAT_KEY))
    .limit(1);

  const format = result[0]?.value as OllamaApiFormat | null;
  return format || "native";
}

/**
 * Set the Ollama API format
 */
export async function setOllamaApiFormat(
  format: OllamaApiFormat
): Promise<void> {
  logger.info("Updating Ollama API format", { format });

  await db
    .insert(config)
    .values({
      key: OLLAMA_API_FORMAT_KEY,
      value: format as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: config.key,
      set: {
        value: format as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      },
    });
}

/**
 * Set the Ollama base URL
 */
export async function setOllamaBaseUrl(url: string): Promise<void> {
  logger.info("Updating Ollama base URL", { url });

  await db
    .insert(config)
    .values({
      key: OLLAMA_URL_KEY,
      value: url as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: config.key,
      set: {
        value: url as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      },
    });
}

/**
 * Get model configurations
 * Returns default config if not set
 */
export async function getModelConfigs(): Promise<ModelConfig[]> {
  const result = await db
    .select()
    .from(config)
    .where(eq(config.key, OLLAMA_MODELS_KEY))
    .limit(1);

  const configs = result[0]?.value as ModelConfig[] | null;

  // Default configuration if not set
  if (!configs) {
    return [
      {
        id: "chat-model",
        displayName: "Qwen3 Chat",
        enabled: true,
        isDefault: true,
        reasoning: false,
      },
      {
        id: "chat-model-reasoning",
        displayName: "Qwen3 Reasoning",
        enabled: true,
        isDefault: false,
        reasoning: true,
      },
    ];
  }

  return configs;
}

/**
 * Set model configurations
 */
export async function setModelConfigs(configs: ModelConfig[]): Promise<void> {
  // Validation: at least one model must be enabled
  if (!configs.some((c) => c.enabled)) {
    throw new Error("At least one model must be enabled");
  }

  // Validation: exactly one model must be default
  const defaultCount = configs.filter((c) => c.enabled && c.isDefault).length;
  if (defaultCount !== 1) {
    throw new Error("Exactly one enabled model must be set as default");
  }

  logger.info("Updating model configurations", { count: configs.length });

  await db
    .insert(config)
    .values({
      key: OLLAMA_MODELS_KEY,
      value: configs as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: config.key,
      set: {
        value: configs as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      },
    });
}

/**
 * Test connection to Ollama server
 * Returns true if connection is successful
 * Supports both native and OpenAI-compatible formats
 */
export async function testOllamaConnection(
  url: string,
  format?: OllamaApiFormat
): Promise<boolean> {
  try {
    // Get format from database if not provided
    const apiFormat = format || (await getOllamaApiFormat());

    logger.info("Testing Ollama connection", { url, format: apiFormat });

    let endpoint: string;
    if (apiFormat === "native") {
      // Use native Ollama API
      endpoint = `${url}/api/tags`;
    } else {
      // Use OpenAI-compatible API
      const baseUrl = url.endsWith("/v1") ? url : `${url}/v1`;
      endpoint = `${baseUrl}/models`;
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(30_000), // 30 second timeout
    });

    if (!response.ok) {
      logger.warn("Ollama connection test failed", {
        url,
        format: apiFormat,
        endpoint,
        status: response.status,
      });
      return false;
    }

    logger.info("Ollama connection test successful", {
      url,
      format: apiFormat,
      endpoint,
    });
    return true;
  } catch (error) {
    const errorType =
      error instanceof Error && error.name === "TimeoutError"
        ? "timeout"
        : error instanceof Error && error.name === "TypeError"
          ? "network"
          : "unknown";

    logger.error("Ollama connection test error", {
      url,
      endpoint:
        format === "native"
          ? `${url}/api/tags`
          : `${url.endsWith("/v1") ? url : `${url}/v1`}/models`,
      format,
      errorType,
      error,
    });
    return false;
  }
}

/**
 * Fetch available models from Ollama server
 * Supports both native (/api/tags) and OpenAI-compatible (/v1/models) endpoints
 */
export async function fetchOllamaModels(
  url: string,
  format?: OllamaApiFormat
): Promise<OllamaModel[]> {
  try {
    // Get format from database if not provided
    const apiFormat = format || (await getOllamaApiFormat());

    logger.debug("Fetching Ollama models", { url, format: apiFormat });

    let endpoint: string;
    if (apiFormat === "native") {
      // Use native Ollama API
      endpoint = `${url}/api/tags`;
    } else {
      // Use OpenAI-compatible API
      const baseUrl = url.endsWith("/v1") ? url : `${url}/v1`;
      endpoint = `${baseUrl}/models`;
    }

    const startTime = Date.now();
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(30_000), // 30 second timeout
    });
    const duration = Date.now() - startTime;

    if (!response.ok) {
      // Try to get response body for more context
      let responseBody: string | undefined;
      try {
        responseBody = await response.text();
      } catch {
        // Ignore if we can't read the body
      }

      logger.error("Ollama API returned error status", {
        url,
        endpoint,
        format: apiFormat,
        status: response.status,
        statusText: response.statusText,
        responseBody,
        duration,
      });

      throw new Error(
        `Failed to fetch models: ${response.status} ${response.statusText}`
      );
    }

    let models: OllamaModel[];
    if (apiFormat === "native") {
      const data = (await response.json()) as { models: OllamaNativeModel[] };
      models = data.models || [];
    } else {
      const data = (await response.json()) as { data: OllamaOpenAIModel[] };
      models = data.data || [];
    }

    logger.info("Fetched Ollama models", {
      url,
      format: apiFormat,
      endpoint,
      count: models.length,
    });

    return models;
  } catch (error) {
    // Determine error type for better diagnostics
    const errorType =
      error instanceof Error && error.name === "TimeoutError"
        ? "timeout"
        : error instanceof Error && error.name === "TypeError"
          ? "network"
          : "unknown";

    logger.error("Failed to fetch Ollama models", {
      url,
      endpoint:
        format === "native"
          ? `${url}/api/tags`
          : `${url.endsWith("/v1") ? url : `${url}/v1`}/models`,
      format: format || "native",
      errorType,
      error,
    });
    throw error;
  }
}

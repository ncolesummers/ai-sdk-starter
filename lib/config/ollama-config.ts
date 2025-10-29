import "server-only";

import { eq } from "drizzle-orm";
import { db } from "../db/queries";
import { config } from "../db/schema";
import { createLogger } from "../logger";

const logger = createLogger("ollama-config");

// Configuration keys
const OLLAMA_URL_KEY = "ollama_base_url";
const OLLAMA_MODELS_KEY = "ollama_models_config";

// Model configuration interface
export type ModelConfig = {
  id: string;
  displayName: string;
  enabled: boolean;
  isDefault: boolean;
  reasoning: boolean;
};

// Ollama API model response
export type OllamaModel = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
};

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
    configuredUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1"
  );
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
 */
export async function testOllamaConnection(url: string): Promise<boolean> {
  try {
    logger.info("Testing Ollama connection", { url });

    // Ensure URL ends with /v1
    const baseUrl = url.endsWith("/v1") ? url : `${url}/v1`;

    const response = await fetch(`${baseUrl}/models`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10_000), // 10 second timeout
    });

    if (!response.ok) {
      logger.warn("Ollama connection test failed", {
        url,
        status: response.status,
      });
      return false;
    }

    logger.info("Ollama connection test successful", { url });
    return true;
  } catch (error) {
    logger.error("Ollama connection test error", { url, error });
    return false;
  }
}

/**
 * Fetch available models from Ollama server
 */
export async function fetchOllamaModels(url: string): Promise<OllamaModel[]> {
  try {
    logger.debug("Fetching Ollama models", { url });

    // Ensure URL ends with /v1
    const baseUrl = url.endsWith("/v1") ? url : `${url}/v1`;

    const response = await fetch(`${baseUrl}/models`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10_000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = (await response.json()) as { data: OllamaModel[] };
    logger.info("Fetched Ollama models", {
      url,
      count: data.data?.length ?? 0,
    });

    return data.data || [];
  } catch (error) {
    logger.error("Failed to fetch Ollama models", { url, error });
    throw error;
  }
}

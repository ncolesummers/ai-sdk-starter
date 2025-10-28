import "server-only";

import { getModelConfigs, type ModelConfig } from "../config/ollama-config";
import { type ChatModel, DEFAULT_CHAT_MODEL } from "./models";

// Re-export ModelConfig type for convenience - used internally and exported for consumers
export type { ModelConfig } from "../config/ollama-config";

/**
 * Get active models from configuration
 * Returns only enabled models with their display names
 */
export async function getActiveModels(): Promise<ChatModel[]> {
  const configs = await getModelConfigs();

  return configs
    .filter((config: ModelConfig) => config.enabled)
    .map((config: ModelConfig) => ({
      id: config.id,
      name: config.displayName,
      description: config.reasoning
        ? "Reasoning model with advanced problem-solving capabilities"
        : "Fast and efficient chat model",
      reasoning: config.reasoning,
    }));
}

/**
 * Get the default model ID from configuration
 */
export async function getDefaultModelId(): Promise<string> {
  const configs = await getModelConfigs();
  const defaultModel = configs.find(
    (config: ModelConfig) => config.enabled && config.isDefault
  );

  return defaultModel?.id || DEFAULT_CHAT_MODEL;
}

/**
 * Check if a model ID is valid and enabled
 */
export async function isModelEnabled(modelId: string): Promise<boolean> {
  const configs = await getModelConfigs();
  const model = configs.find((config: ModelConfig) => config.id === modelId);

  return model?.enabled ?? false;
}

/**
 * Get model configuration by ID
 */
export async function getModelConfig(
  modelId: string
): Promise<ModelConfig | null> {
  const configs = await getModelConfigs();
  return configs.find((config: ModelConfig) => config.id === modelId) || null;
}

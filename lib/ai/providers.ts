import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import type { LanguageModelMiddleware } from "ai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { getModelConfigs, getOllamaBaseUrl } from "../config/ollama-config";
import { isTestEnvironment } from "../constants";
import { createLogger } from "../logger";

const logger = createLogger("providers");

/**
 * Create an Ollama provider instance with dynamic models from database
 */
async function createOllamaProvider(baseURL: string) {
  logger.info("Creating Ollama provider", { baseURL });

  const ollama = createOpenAICompatible({
    name: "ollama",
    baseURL,
  });

  // Fetch model configurations from database
  const configs = await getModelConfigs();

  // Build language models dynamically from database config
  const languageModels: Record<string, LanguageModelV2> = {};

  for (const config of configs) {
    if (!config.enabled) {
      continue;
    }

    const baseModel = ollama(config.id) as LanguageModelV2;

    // Apply reasoning middleware only if configured as reasoning model
    if (config.reasoning) {
      languageModels[config.id] = wrapLanguageModel({
        model: baseModel,
        middleware: extractReasoningMiddleware({
          tagName: "think",
        }) as LanguageModelMiddleware,
      });
    } else {
      languageModels[config.id] = baseModel;
    }
  }

  // Add special-purpose models (title and artifact generation)
  // Use the default model or fall back to first enabled model
  const defaultModel = configs.find((c) => c.enabled && c.isDefault);
  const specialModelId =
    defaultModel?.id || configs.find((c) => c.enabled)?.id || "qwen3:14b";

  // Check if special model is a reasoning model and apply middleware if needed
  const specialModelConfig = configs.find((c) => c.id === specialModelId);
  const baseSpecialModel = ollama(specialModelId) as LanguageModelV2;

  if (specialModelConfig?.reasoning) {
    // Apply reasoning middleware to extract <think> tags from special models
    const wrappedSpecialModel = wrapLanguageModel({
      model: baseSpecialModel,
      middleware: extractReasoningMiddleware({
        tagName: "think",
      }) as LanguageModelMiddleware,
    });
    languageModels["title-model"] = wrappedSpecialModel;
    languageModels["artifact-model"] = wrappedSpecialModel;
  } else {
    languageModels["title-model"] = baseSpecialModel;
    languageModels["artifact-model"] = baseSpecialModel;
  }

  logger.info("Provider created with dynamic models", {
    modelCount: Object.keys(languageModels).length - 2, // Exclude title and artifact
    specialModel: specialModelId,
  });

  return customProvider({ languageModels });
}

/**
 * Get a provider instance
 * Fetches the Ollama base URL from configuration and creates a fresh provider with dynamic models
 */
export async function getProvider() {
  // Return mock provider in test environment
  if (isTestEnvironment) {
    const {
      artifactModel,
      reasoningModel,
      titleModel,
    } = require("./models.mock");
    return customProvider({
      languageModels: {
        "chat-model": reasoningModel,
        "gpt-oss:20b": reasoningModel,
        "title-model": titleModel,
        "artifact-model": artifactModel,
      },
    });
  }

  // Get current Ollama base URL from configuration
  const configuredURL = await getOllamaBaseUrl();

  // AI SDK always expects OpenAI-compatible format (/v1) for chat completions
  // regardless of the API format used for model discovery
  const baseURL = configuredURL.endsWith("/v1")
    ? configuredURL
    : `${configuredURL}/v1`;

  // Create new provider with dynamic models from database
  logger.debug("Creating provider instance", { baseURL, configuredURL });
  const provider = await createOllamaProvider(baseURL);

  return provider;
}

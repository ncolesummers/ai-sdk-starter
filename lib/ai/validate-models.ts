import { createLogger } from "../logger";
import { chatModels } from "./models";

const logger = createLogger("ai:validate-models");

type OllamaModel = {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
};

type OllamaTagsResponse = {
  models: OllamaModel[];
};

/**
 * Validates that all configured chat models exist in the Ollama instance
 * @returns Promise<void>
 * @throws Error if validation fails in production
 */
export async function validateModels(): Promise<void> {
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  try {
    logger.info("Validating configured models against Ollama instance", {
      ollamaBaseUrl,
      configuredModels: chatModels.map((m) => m.id),
    });

    const response = await fetch(`${ollamaBaseUrl}/api/tags`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(
        `Ollama API returned ${response.status}: ${response.statusText}`
      );
    }

    const data: OllamaTagsResponse = await response.json();
    const availableModels = new Set(data.models.map((m) => m.name));

    logger.debug("Available Ollama models", {
      models: Array.from(availableModels),
    });

    // Check each configured chat model
    const missingModels: string[] = [];
    const validModels: string[] = [];

    for (const chatModel of chatModels) {
      // Extract model name from ID (handles both "model-name" and "provider:model")
      const modelId =
        chatModel.id === "chat-model" ? "qwen3:14b" : chatModel.id;

      if (availableModels.has(modelId)) {
        validModels.push(modelId);
      } else {
        missingModels.push(modelId);
      }
    }

    if (validModels.length > 0) {
      logger.info("Valid models found", { models: validModels });
    }

    if (missingModels.length > 0) {
      const errorMessage = `Missing Ollama models: ${missingModels.join(", ")}. Please install them using: ${missingModels.map((m) => `ollama pull ${m}`).join(" && ")}`;

      logger.error("Model validation failed", {
        missingModels,
        availableModels: Array.from(availableModels),
      });

      // Fail fast in production
      if (process.env.NODE_ENV === "production") {
        throw new Error(errorMessage);
      }

      // Warn in development
      logger.warn(errorMessage);
    } else {
      logger.info("All configured models are available in Ollama", {
        modelCount: validModels.length,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("Model validation failed", {
      error: errorMessage,
      ollamaBaseUrl,
    });

    // Fail fast in production
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Model validation failed: ${errorMessage}`);
    }

    // Warn in development
    logger.warn(
      `Model validation failed (development mode, continuing): ${errorMessage}`
    );
  }
}

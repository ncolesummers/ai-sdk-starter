import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

// Create Ollama provider using OpenAI-compatible API
// This provides maximum portability and works with any OpenAI-compatible endpoint
const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
});

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        "chat-model": ollama("qwen3:14b"),
        "chat-model-reasoning": wrapLanguageModel({
          model: ollama("qwen3:14b"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": ollama("qwen3:14b"),
        "artifact-model": ollama("qwen3:14b"),
      },
    });

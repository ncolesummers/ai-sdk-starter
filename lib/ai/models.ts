/**
 * Client-safe model definitions and types
 * Server-side model functions are in models.server.ts
 */

export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
  reasoning?: boolean;
};

/**
 * Static model definitions for fallback and client-side use
 * The model selector will fetch active models from /api/models,
 * but falls back to this array if the API is unavailable
 */
export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "Qwen3",
    description: "14B parameter model with chain-of-thought reasoning",
  },
  {
    id: "gpt-oss:20b",
    name: "GPT-OSS",
    description: "20B parameter open-source GPT model",
  },
];

export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

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

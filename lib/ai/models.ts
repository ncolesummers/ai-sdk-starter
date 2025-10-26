export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "Qwen3 Chat",
    description:
      "14B parameter model with strong reasoning and multimodal capabilities",
  },
  {
    id: "chat-model-reasoning",
    name: "Qwen3 Reasoning",
    description:
      "Uses advanced chain-of-thought reasoning for complex problems",
  },
];

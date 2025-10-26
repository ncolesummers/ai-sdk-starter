import type { ChatModel } from "./models";

export type UserType = "regular";

type Entitlements = {
  maxMessagesPerDay: number;
  availableChatModelIds: ChatModel["id"][];
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For authenticated users
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: ["chat-model", "gpt-oss:20b"],
  },

  /*
   * TODO: For users with a paid membership
   */
};

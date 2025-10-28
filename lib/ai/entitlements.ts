export type UserType = "regular";

type Entitlements = {
  maxMessagesPerDay: number;
  // "all" means all enabled models are available
  // string[] allows filtering to specific model IDs
  availableChatModelIds: "all" | string[];
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For authenticated users - allow all enabled models configured via admin panel
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: "all",
  },

  /*
   * TODO: For users with a paid membership
   */
};

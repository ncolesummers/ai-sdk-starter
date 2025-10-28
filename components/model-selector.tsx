"use client";

import { startTransition, useOptimistic, useState } from "react";
import useSWR from "swr";
import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { entitlementsByUserType, type UserType } from "@/lib/ai/entitlements";
import { type ChatModel, chatModels } from "@/lib/ai/models";
import type { SessionWithUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { CheckCircleFillIcon, ChevronDownIcon } from "./icons";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ModelSelector({
  session,
  selectedModelId,
  className,
}: {
  session: SessionWithUser;
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  // Fetch active models from API
  const { data } = useSWR<{
    models: ChatModel[];
    defaultModelId: string;
  }>("/api/models", fetcher, {
    fallbackData: {
      models: chatModels,
      defaultModelId: selectedModelId,
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const userType: UserType =
    ((session.user as any).type as UserType) || "regular";
  const { availableChatModelIds } = entitlementsByUserType[userType];

  // Use fetched models or fall back to static models
  const allModels = data?.models || chatModels;

  // Filter models based on user entitlements
  // If entitlement is "all", show all enabled models from admin panel
  const availableChatModels =
    availableChatModelIds === "all"
      ? allModels
      : allModels.filter((chatModel) =>
          availableChatModelIds.includes(chatModel.id)
        );

  const selectedChatModel = availableChatModels.find(
    (chatModel) => chatModel.id === optimisticModelId
  );

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className
        )}
      >
        <Button
          className="md:h-[34px] md:px-2"
          data-testid="model-selector"
          variant="outline"
        >
          {selectedChatModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[280px] max-w-[90vw] sm:min-w-[300px]"
      >
        {availableChatModels.map((chatModel) => {
          const { id } = chatModel;

          return (
            <DropdownMenuItem
              asChild
              data-active={id === optimisticModelId}
              data-testid={`model-selector-item-${id}`}
              key={id}
              onSelect={() => {
                setOpen(false);

                startTransition(() => {
                  setOptimisticModelId(id);
                  saveChatModelAsCookie(id);
                });
              }}
            >
              <button
                className="group/item flex w-full flex-row items-center justify-between gap-2 sm:gap-4"
                type="button"
              >
                <div className="flex flex-col items-start gap-1">
                  <div className="text-sm sm:text-base">{chatModel.name}</div>
                  <div className="line-clamp-2 text-muted-foreground text-xs">
                    {chatModel.description}
                  </div>
                </div>

                <div className="shrink-0 text-foreground opacity-0 group-data-[active=true]/item:opacity-100 dark:text-foreground">
                  <CheckCircleFillIcon />
                </div>
              </button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

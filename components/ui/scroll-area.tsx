"use client";

import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef, Ref } from "react";

type ScrollAreaProps = ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
>;
type ScrollAreaScrollbarProps = ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
>;

import { cn } from "@/lib/utils";

function ScrollArea({
  ref,
  className,
  children,
  ...props
}: ScrollAreaProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <ScrollAreaPrimitive.Root
      className={cn("relative overflow-hidden", className)}
      ref={ref}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

function ScrollBar({
  ref,
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaScrollbarProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-px",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent p-px",
        className
      )}
      orientation={orientation}
      ref={ref}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };

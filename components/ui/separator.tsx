"use client";

import { Separator as SeparatorPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef, Ref } from "react";

type SeparatorPrimitiveProps = ComponentPropsWithoutRef<
  typeof SeparatorPrimitive.Root
>;

import { cn } from "@/lib/utils";

function Separator({
  ref,
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorPrimitiveProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <SeparatorPrimitive.Root
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      decorative={decorative}
      orientation={orientation}
      ref={ref}
      {...props}
    />
  );
}
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };

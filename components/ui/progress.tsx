"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef, Ref } from "react";

type ProgressPrimitiveProps = ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
>;

import { cn } from "@/lib/utils";

function Progress({
  ref,
  className,
  value,
  ...props
}: ProgressPrimitiveProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      ref={ref}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Label as LabelPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef, Ref } from "react";

type LabelPrimitiveProps = ComponentPropsWithoutRef<typeof LabelPrimitive.Root>;

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

function Label({
  ref,
  className,
  ...props
}: LabelPrimitiveProps &
  VariantProps<typeof labelVariants> & { ref?: Ref<HTMLLabelElement> }) {
  return (
    <LabelPrimitive.Root
      className={cn(labelVariants(), className)}
      ref={ref}
      {...props}
    />
  );
}
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

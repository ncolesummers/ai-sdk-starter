"use client";

import { Avatar as AvatarPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef, Ref } from "react";
import { cn } from "@/lib/utils";

type AvatarProps = ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>;
type AvatarImageProps = ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>;
type AvatarFallbackProps = ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Fallback
>;

function Avatar({
  ref,
  className,
  ...props
}: AvatarProps & { ref?: Ref<HTMLSpanElement> }) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
Avatar.displayName = AvatarPrimitive.Root.displayName;

function AvatarImage({
  ref,
  className,
  ...props
}: AvatarImageProps & { ref?: Ref<HTMLImageElement> }) {
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square h-full w-full", className)}
      ref={ref}
      {...props}
    />
  );
}
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

function AvatarFallback({
  ref,
  className,
  ...props
}: AvatarFallbackProps & { ref?: Ref<HTMLSpanElement> }) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

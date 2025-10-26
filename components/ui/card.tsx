import type { HTMLAttributes, Ref } from "react";

import { cn } from "@/lib/utils";

function Card({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
Card.displayName = "Card";

function CardHeader({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      ref={ref}
      {...props}
    />
  );
}
CardHeader.displayName = "CardHeader";

function CardTitle({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      className={cn(
        "font-semibold text-2xl leading-none tracking-tight",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
CardTitle.displayName = "CardTitle";

function CardDescription({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      className={cn("text-muted-foreground text-sm", className)}
      ref={ref}
      {...props}
    />
  );
}
CardDescription.displayName = "CardDescription";

function CardContent({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return <div className={cn("p-6 pt-0", className)} ref={ref} {...props} />;
}
CardContent.displayName = "CardContent";

function CardFooter({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      ref={ref}
      {...props}
    />
  );
}
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

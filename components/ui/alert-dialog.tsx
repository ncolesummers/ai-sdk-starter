"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef, HTMLAttributes, Ref } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AlertDialogActionProps = ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Action
>;
type AlertDialogCancelProps = ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Cancel
>;
type AlertDialogContentProps = ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Content
>;
type AlertDialogDescriptionProps = ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Description
>;
type AlertDialogOverlayProps = ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Overlay
>;
type AlertDialogTitleProps = ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Title
>;

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

function AlertDialogOverlay({
  ref,
  className,
  ...props
}: AlertDialogOverlayProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <AlertDialogPrimitive.Overlay
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in",
        className
      )}
      {...props}
      ref={ref}
    />
  );
}
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

function AlertDialogContent({
  ref,
  className,
  ...props
}: AlertDialogContentProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        className={cn(
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:rounded-lg",
          className
        )}
        ref={ref}
        {...props}
      />
    </AlertDialogPortal>
  );
}
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

function AlertDialogHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}
AlertDialogHeader.displayName = "AlertDialogHeader";

function AlertDialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  );
}
AlertDialogFooter.displayName = "AlertDialogFooter";

function AlertDialogTitle({
  ref,
  className,
  ...props
}: AlertDialogTitleProps & { ref?: Ref<HTMLHeadingElement> }) {
  return (
    <AlertDialogPrimitive.Title
      className={cn("font-semibold text-lg", className)}
      ref={ref}
      {...props}
    />
  );
}
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

function AlertDialogDescription({
  ref,
  className,
  ...props
}: AlertDialogDescriptionProps & { ref?: Ref<HTMLParagraphElement> }) {
  return (
    <AlertDialogPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      ref={ref}
      {...props}
    />
  );
}
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

function AlertDialogAction({
  ref,
  className,
  ...props
}: AlertDialogActionProps & { ref?: Ref<HTMLButtonElement> }) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      ref={ref}
      {...props}
    />
  );
}
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

function AlertDialogCancel({
  ref,
  className,
  ...props
}: AlertDialogCancelProps & { ref?: Ref<HTMLButtonElement> }) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(
        buttonVariants({ variant: "outline" }),
        "mt-2 sm:mt-0",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

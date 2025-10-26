"use client";

import { Check, ChevronRight, Circle } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type {
  ComponentPropsWithoutRef,
  HTMLAttributes,
  ReactNode,
  Ref,
} from "react";

type DropdownMenuCheckboxItemProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.CheckboxItem
>;
type DropdownMenuContentProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
>;
type DropdownMenuItemProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Item
>;
type DropdownMenuLabelProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Label
>;
type DropdownMenuRadioItemProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.RadioItem
>;
type DropdownMenuSeparatorProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
>;
type DropdownMenuSubContentProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.SubContent
>;
type DropdownMenuSubTriggerProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.SubTrigger
>;

import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

function DropdownMenuSubTrigger({
  ref,
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps & {
  inset?: boolean;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

function DropdownMenuSubContent({
  ref,
  className,
  ...props
}: DropdownMenuSubContentProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <DropdownMenuPrimitive.SubContent
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 origin-[--radix-dropdown-menu-content-transform-origin] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=closed]:animate-out data-[state=open]:animate-in",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

function DropdownMenuContent({
  ref,
  className,
  sideOffset = 4,
  ...props
}: DropdownMenuContentProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        className={cn(
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-32 origin-[--radix-dropdown-menu-content-transform-origin] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in",
          className
        )}
        ref={ref}
        sideOffset={sideOffset}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

function DropdownMenuItem({
  ref,
  className,
  inset,
  ...props
}: DropdownMenuItemProps & {
  inset?: boolean;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

function DropdownMenuCheckboxItem({
  ref,
  className,
  children,
  checked,
  ...props
}: DropdownMenuCheckboxItemProps & {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

function DropdownMenuRadioItem({
  ref,
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps & {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

function DropdownMenuLabel({
  ref,
  className,
  inset,
  ...props
}: DropdownMenuLabelProps & {
  inset?: boolean;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        "px-2 py-1.5 font-semibold text-sm",
        inset && "pl-8",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

function DropdownMenuSeparator({
  ref,
  className,
  ...props
}: DropdownMenuSeparatorProps & { ref?: Ref<HTMLDivElement> }) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      ref={ref}
      {...props}
    />
  );
}
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

function DropdownMenuShortcut({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};

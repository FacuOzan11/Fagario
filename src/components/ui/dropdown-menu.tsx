"use client";

import type * as React from "react";
import { DropdownMenu as MenuPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function DropdownMenu(props: React.ComponentProps<typeof MenuPrimitive.Root>) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger(
  props: React.ComponentProps<typeof MenuPrimitive.Trigger>,
) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
  className,
  sideOffset = 6,
  align = "end",
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        collisionPadding={16}
        className={cn(
          "border-border bg-surface text-foreground shadow-foreground/8 z-50 min-w-56 rounded-md border p-1.5 shadow-lg outline-none",
          "animate-in fade-in-0 zoom-in-[0.97] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-150",
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Label>) {
  return (
    <MenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn(
        "text-eyebrow text-subtle-foreground px-2.5 pt-1.5 pb-1",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item>) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-sm px-2.5 text-sm outline-none select-none",
        "data-[highlighted]:bg-surface-muted data-[disabled]:text-muted-foreground data-[disabled]:cursor-default",
        "[&_svg]:size-[1.125rem] [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
};

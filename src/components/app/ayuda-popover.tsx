"use client";

import type * as React from "react";
import { Question } from "@phosphor-icons/react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { copy } from "@/content/copy";
import { cn } from "@/lib/utils";

/** Botón "?" que abre una explicación. Funciona con tap (mobile), click y teclado. */
export function AyudaPopover({
  title,
  label = copy.comun.ayuda,
  children,
  className,
}: {
  title: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={label}
        className={cn(
          "text-subtle-foreground -m-2.5 inline-flex size-11 cursor-pointer items-center justify-center rounded-full outline-none",
          "hover:text-foreground focus-visible:ring-ring data-[state=open]:text-foreground transition-colors duration-150 focus-visible:ring-2",
          className,
        )}
      >
        <Question weight="light" aria-hidden className="size-5" />
      </PopoverTrigger>
      <PopoverContent align="end" className="grid gap-3">
        <p className="font-serif text-xl leading-tight">{title}</p>
        {children}
      </PopoverContent>
    </Popover>
  );
}

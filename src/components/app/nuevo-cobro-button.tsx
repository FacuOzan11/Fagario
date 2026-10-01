"use client";

import type * as React from "react";
import { Plus, Sparkle } from "@phosphor-icons/react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { copy } from "@/content/copy";

/** "Nuevo cobro": en Fase 1 abre un aviso de "próximamente". */
export function NuevoCobroButton({
  children = copy.cobros.acciones.nuevo,
  ...props
}: ButtonProps & { children?: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button {...props}>
          <Plus weight="light" aria-hidden />
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex gap-3">
        <Sparkle
          weight="light"
          aria-hidden
          className="text-accent mt-0.5 size-5 shrink-0"
        />
        <div className="grid gap-1">
          <p className="font-medium">{copy.proximamente.etiqueta}</p>
          <p className="text-muted-foreground">
            {copy.cobros.nuevoProximamente}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

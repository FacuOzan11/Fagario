"use client";

import { CheckCircle, DotsThreeVertical, Scroll } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copy } from "@/content/copy";

/** Acciones de un cobro. Fase 1: visibles pero deshabilitadas ("Próximamente"). */
export function CobroAcciones({ cliente }: { cliente: string }) {
  const a = copy.cobros.acciones;
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${a.masOpciones}: ${cliente}`}
          className="text-muted-foreground hover:text-foreground data-[state=open]:bg-surface-muted"
        >
          <DotsThreeVertical weight="light" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{copy.cobros.accionProximamente}</DropdownMenuLabel>
        {[
          { label: a.marcarCobrado, icon: CheckCircle },
          { label: a.facturar, icon: Scroll },
        ].map(({ label, icon: Icon }) => (
          <DropdownMenuItem key={label} disabled>
            <Icon weight="light" aria-hidden />
            <span className="flex-1">{label}</span>
            <span className="border-border text-subtle-foreground rounded-full border px-2 text-[0.6875rem] leading-5">
              {copy.nav.badgeProximamente}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

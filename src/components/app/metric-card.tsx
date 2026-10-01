import type * as React from "react";

import { Money } from "@/components/ui/money";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  /** Centavos ARS (total estimado). */
  cents: number;
  description?: React.ReactNode;
  /** Desglose por moneda, ej. "$ 538.000 + US$ 580". */
  breakdown?: React.ReactNode;
  tone?: "default" | "danger";
  /** Ayuda contextual (ej. un popover) junto al label. */
  help?: React.ReactNode;
  className?: string;
};

export function MetricCard({
  label,
  cents,
  description,
  breakdown,
  tone = "default",
  help,
  className,
}: MetricCardProps) {
  const danger = tone === "danger";
  return (
    <div
      data-slot="metric-card"
      data-tone={tone}
      className={cn(
        "bg-surface flex min-w-0 flex-col gap-3.5 rounded-lg border p-5 sm:gap-5 sm:p-6",
        danger ? "border-danger/35" : "border-border",
        className,
      )}
    >
      <div className="flex min-h-6 items-center justify-between gap-2">
        <p
          className={cn(
            "flex items-center gap-2 text-sm",
            danger ? "text-danger-foreground" : "text-muted-foreground",
          )}
        >
          {danger ? (
            <span aria-hidden className="bg-danger size-1.5 rounded-full" />
          ) : null}
          {label}
        </p>
        {help}
      </div>
      <div className="grid gap-1.5">
        <Money
          cents={cents}
          size="lg"
          animate
          className={cn("block truncate", danger && "text-danger-foreground")}
        />
        {breakdown ? (
          <p className="text-muted-foreground truncate text-xs tabular-nums">
            {breakdown}
          </p>
        ) : null}
      </div>
      {description ? (
        <p className="text-muted-foreground mt-auto text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}

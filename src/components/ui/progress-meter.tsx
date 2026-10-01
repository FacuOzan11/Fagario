"use client";

import type * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "danger";

const fillVariants = cva("absolute inset-y-0 left-0 rounded-full", {
  variants: { tone: { ok: "bg-ok", warn: "bg-warn", danger: "bg-danger" } },
  defaultVariants: { tone: "ok" },
});

type Tick = {
  /** Posición 0–1. */
  value: number;
  /** Texto visible debajo del marcador (opcional). */
  label?: string;
};

type ProgressMeterProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Valor 0–1 (se recorta a ese rango para el dibujo). */
  value: number;
  tone?: Tone;
  /** Marcadores, por ejemplo umbrales del semáforo. */
  ticks?: Tick[];
  /** Nombre accesible del medidor. */
  label: string;
  /** Texto legible del valor, ej. "72 % del tope". */
  valueText?: string;
  /** Grosor de la barra: md 8px, lg 12px. */
  size?: "md" | "lg";
};

const clamp = (n: number) => Math.min(1, Math.max(0, n));

function ProgressMeter({
  value,
  tone = "ok",
  ticks,
  label,
  valueText,
  size = "md",
  className,
  ...props
}: ProgressMeterProps) {
  const reduce = useReducedMotion();
  const v = clamp(value);
  const pct = Math.round(v * 1000) / 10;
  const hasLabels = ticks?.some((t) => t.label);

  return (
    <div data-slot="progress-meter" data-tone={tone} className={cn("w-full", className)} {...props}>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={valueText ?? `${pct.toLocaleString("es-AR")} %`}
        className={cn("relative w-full rounded-full bg-surface-muted", size === "lg" ? "h-3" : "h-2")}
      >
        <motion.div
          className={fillVariants({ tone })}
          initial={reduce ? false : { width: "0%" }}
          animate={{ width: `${v * 100}%` }}
          transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        {ticks?.map((t) => (
          <span
            key={t.value}
            aria-hidden
            className="absolute -top-1.5 -bottom-1.5 w-0.5 -translate-x-1/2 rounded-full bg-border-strong ring-2 ring-background"
            style={{ left: `${clamp(t.value) * 100}%` }}
          />
        ))}
      </div>
      {hasLabels ? (
        <div aria-hidden className="relative mt-2.5 h-4 text-xs leading-4 text-muted-foreground tabular-nums">
          {ticks?.map((t) =>
            t.label ? (
              <span
                key={t.value}
                className="absolute -translate-x-1/2 whitespace-nowrap"
                style={{ left: `${clamp(t.value) * 100}%` }}
              >
                {t.label}
              </span>
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  );
}

export { ProgressMeter };
export type { ProgressMeterProps, Tick };

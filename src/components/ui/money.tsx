"use client";

import * as React from "react";
import { animate as animateValue, useMotionValue, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { Moneda } from "@/lib/domain/types";
import { formatMoney, NBSP } from "@/content/format";

type MoneySize = "sm" | "md" | "lg" | "xl" | "display";

const sizeClass: Record<MoneySize, string> = {
  sm: "font-sans text-sm tabular-nums",
  md: "font-sans text-base font-medium tabular-nums",
  lg: "text-figure-lg",
  xl: "text-figure-xl",
  display: "text-display tabular-nums lining-nums",
};

const isLarge = (size: MoneySize) => size === "lg" || size === "xl" || size === "display";

type MoneyProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Monto en centavos enteros. */
  cents: number;
  currency?: Moneda;
  size?: MoneySize;
  /** Cuenta desde 0 al montarse (respeta prefers-reduced-motion). */
  animate?: boolean;
  /** Decimales visibles. Por defecto: 0 en lg+; en sm/md solo si hay centavos. */
  decimals?: 0 | 2;
};

function Parts({ value, currency, decimals, large }: { value: number; currency: Moneda; decimals: 0 | 2; large: boolean }) {
  const text = formatMoney(value, currency, { decimals });
  if (!large) return <>{text}</>;
  // "-$ 1.234" -> símbolo chico y elevado, número protagonista.
  const sep = text.indexOf(NBSP);
  return (
    <>
      <span className="mr-[0.08em] align-[0.32em] text-[0.5em] tracking-normal text-muted-foreground">
        {text.slice(0, sep)}
      </span>
      {text.slice(sep + 1)}
    </>
  );
}

function Money({
  cents,
  currency = "ARS",
  size = "md",
  animate = false,
  decimals,
  className,
  ...props
}: MoneyProps) {
  const large = isLarge(size);
  const dec = decimals ?? (large ? 0 : cents % 100 !== 0 ? 2 : 0);
  const fullLabel = formatMoney(cents, currency, { decimals: cents % 100 !== 0 ? 2 : 0 });

  const reduce = useReducedMotion();
  const motionValue = useMotionValue(animate ? 0 : cents);
  const [shown, setShown] = React.useState(animate ? 0 : cents);

  React.useEffect(() => {
    if (!animate || reduce) {
      motionValue.jump(cents);
      return;
    }
    const controls = animateValue(motionValue, cents, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [animate, reduce, cents, motionValue]);

  React.useEffect(() => motionValue.on("change", (v) => setShown(Math.round(v))), [motionValue]);

  const value = !animate || reduce ? cents : shown;

  return (
    <span
      data-slot="money"
      data-size={size}
      className={cn("whitespace-nowrap", sizeClass[size], className)}
      {...props}
    >
      <span className="sr-only">{fullLabel}</span>
      <span aria-hidden>
        <Parts value={value} currency={currency} decimals={dec} large={large} />
      </span>
    </span>
  );
}

export { Money };
export type { MoneyProps, MoneySize };

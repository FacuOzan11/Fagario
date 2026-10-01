import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs leading-5 font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral: "bg-surface-muted text-muted-foreground",
        accent: "bg-accent-soft text-accent",
        ok: "bg-ok-soft text-ok-foreground",
        warn: "bg-warn-soft text-warn-foreground",
        danger: "bg-danger-soft text-danger-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

const dotVariants = cva("size-1.5 shrink-0 rounded-full", {
  variants: {
    variant: {
      neutral: "bg-subtle-foreground",
      accent: "bg-accent",
      ok: "bg-ok",
      warn: "bg-warn",
      danger: "bg-danger",
    },
  },
  defaultVariants: { variant: "neutral" },
});

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    /** Muestra un punto de color a la izquierda. */
    dot?: boolean;
  };

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant ?? "neutral"}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {dot ? <span aria-hidden className={dotVariants({ variant })} /> : null}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };

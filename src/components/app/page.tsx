import type * as React from "react";

import { cn } from "@/lib/utils";

/** Contenedor de página dentro del AppShell. */
export function PageContainer({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-5 pt-8 pb-16 sm:px-8 md:pt-14 md:pb-24 lg:px-12",
        className,
      )}
      {...props}
    />
  );
}

type RevealProps = React.ComponentProps<"div"> & {
  /** Orden en el stagger (0, 1, 2…): 50ms entre secciones. */
  index?: number;
  as?: "div" | "section" | "header";
};

/** Entrada sutil: fade + 6px, 200ms. Sin animación con prefers-reduced-motion. */
export function Reveal({
  index = 0,
  as: Comp = "div",
  className,
  style,
  ...props
}: RevealProps) {
  return (
    <Comp
      className={cn("animate-rise", className)}
      style={{ animationDelay: `${index * 50}ms`, ...style }}
      {...props}
    />
  );
}

/** Encabezado de sección: título serif + acción opcional a la derecha. */
export function SectionHeader({
  id,
  title,
  description,
  action,
  className,
}: {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="grid gap-1">
        <h2 id={id} className="text-heading">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

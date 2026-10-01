import type * as React from "react";
import type { Icon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

type EmptyStateProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Componente de Phosphor (importar desde `@phosphor-icons/react/dist/ssr` en Server Components). */
  icon?: Icon;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** CTA (por ejemplo, un <Button>). */
  action?: React.ReactNode;
  /** Nivel del título según la jerarquía de la página. */
  headingLevel?: "h1" | "h2" | "h3";
};

function EmptyState({
  icon: IconComp,
  title,
  description,
  action,
  headingLevel: Heading = "h3",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center gap-5 rounded-lg border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
      {...props}
    >
      {IconComp ? (
        <IconComp weight="light" aria-hidden className="size-14 text-subtle-foreground" />
      ) : null}
      <div className="grid max-w-md gap-2">
        <Heading className="text-title text-foreground">{title}</Heading>
        {description ? <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="mt-1 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };

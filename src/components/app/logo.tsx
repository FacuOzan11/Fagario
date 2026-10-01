import Link from "next/link";

import { copy } from "@/content/copy";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "text-foreground inline-flex items-baseline rounded-sm font-serif text-[1.75rem] leading-none tracking-[-0.02em]",
        className,
      )}
    >
      {copy.app.nombre}
      <span aria-hidden className="text-accent">
        .
      </span>
    </Link>
  );
}

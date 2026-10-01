import Link from "next/link";

import { copy, type FiltroCobros } from "@/content/copy";
import { cn } from "@/lib/utils";

export const FILTROS: FiltroCobros[] = [
  "todos",
  "por_cobrar",
  "atrasado",
  "cobrado",
];

/** Control segmentado de filtros. Son links (cambian la URL), con aria-current en el activo. */
export function FiltroCobrosNav({
  activo,
  conteos,
}: {
  activo: FiltroCobros;
  conteos: Record<FiltroCobros, number>;
}) {
  return (
    <nav
      aria-label={copy.cobros.filtrosAria}
      className="-mx-5 scrollbar-none overflow-x-auto px-5 sm:mx-0 sm:px-0"
    >
      <ul className="bg-surface-muted inline-flex gap-1 rounded-full p-1">
        {FILTROS.map((f) => {
          const on = f === activo;
          return (
            <li key={f}>
              <Link
                href={f === "todos" ? "/cobros" : `/cobros?estado=${f}`}
                aria-current={on ? "page" : undefined}
                scroll={false}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-full px-3.5 text-sm whitespace-nowrap outline-none sm:px-4",
                  "focus-visible:ring-ring transition-colors duration-150 focus-visible:ring-2",
                  on
                    ? "bg-surface text-foreground shadow-foreground/5 font-medium shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {copy.cobros.filtros[f]}
                <span
                  className={cn(
                    "min-w-5 rounded-full px-1.5 text-center text-xs leading-5 tabular-nums",
                    on
                      ? "bg-accent-soft text-accent"
                      : "text-subtle-foreground",
                  )}
                >
                  {conteos[f]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

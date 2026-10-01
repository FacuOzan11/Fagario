import { copy } from "@/content/copy";
import { formatMes, formatMoney } from "@/content/format";
import type { PuntoSerieMensual } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

/**
 * Barras mensuales hechas a mano. Una sola serie (no necesita leyenda):
 * barras finas en acento tenue, el mes en curso en acento pleno, y una línea
 * de referencia con el ritmo mensual que mantiene dentro del tope.
 */
export function GraficoMensual({
  serie,
  tope,
}: {
  serie: PuntoSerieMensual[];
  tope: number;
}) {
  const ritmo = Math.round(tope / 12);
  const max = Math.max(ritmo, ...serie.map((p) => p.montoArs)) * 1.08 || 1;
  const ultimo = serie.length - 1;
  const pctRitmo = (ritmo / max) * 100;

  return (
    <figure className="grid gap-4">
      <div
        role="img"
        aria-label={copy.semaforo.graficoAria(serie.length)}
        className="border-border-strong/60 relative grid h-56 grid-cols-12 items-end gap-1 border-b sm:h-64 sm:gap-2"
      >
        {/* Ritmo para no pasarte (línea de referencia) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-10"
          style={{ bottom: `${pctRitmo}%` }}
        >
          <div className="border-border-strong border-t border-dashed" />
        </div>

        {serie.map((p, i) => {
          const h = (p.montoArs / max) * 100;
          const actual = i === ultimo;
          return (
            <div
              key={p.mes}
              aria-hidden
              className="group relative flex h-full items-end justify-center"
            >
              <div
                className={cn(
                  "w-full max-w-3 rounded-t-[4px] transition-colors duration-150 sm:max-w-4",
                  actual
                    ? "bg-accent"
                    : "bg-accent/30 group-hover:bg-accent/55",
                )}
                style={{ height: `${Math.max(h, p.montoArs > 0 ? 1.5 : 0)}%` }}
              />
              <span
                className={cn(
                  "bg-foreground text-background pointer-events-none absolute z-20 -translate-y-2 rounded-sm px-2 py-1 text-[0.6875rem] whitespace-nowrap tabular-nums opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                  i < 2
                    ? "left-0"
                    : i > ultimo - 2
                      ? "right-0"
                      : "left-1/2 -translate-x-1/2",
                )}
                style={{ bottom: `${h}%` }}
              >
                {formatMes(p.mes, "corto")} · {formatMoney(p.montoArs, "ARS")}
              </span>
            </div>
          );
        })}
      </div>

      <div aria-hidden className="grid grid-cols-12 gap-1 sm:gap-2">
        {serie.map((p, i) => (
          <span
            key={p.mes}
            className={cn(
              "text-center text-[0.6875rem] sm:text-xs",
              i === ultimo
                ? "text-foreground font-medium"
                : "text-subtle-foreground",
            )}
          >
            {formatMes(p.mes, "corto")}
          </span>
        ))}
      </div>

      <figcaption className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="border-border-strong w-5 border-t border-dashed"
          />
          {copy.semaforo.graficoRitmo(formatMoney(ritmo, "ARS"))}
        </span>
        <span>{copy.semaforo.graficoBajada}</span>
      </figcaption>

      <table className="sr-only">
        <caption>{copy.semaforo.graficoTitulo}</caption>
        <thead>
          <tr>
            <th scope="col">{copy.semaforo.graficoMes}</th>
            <th scope="col">{copy.semaforo.graficoMonto}</th>
          </tr>
        </thead>
        <tbody>
          {serie.map((p) => (
            <tr key={p.mes}>
              <th scope="row">
                {formatMes(p.mes)} {p.mes.slice(0, 4)}
              </th>
              <td>{formatMoney(p.montoArs, "ARS")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

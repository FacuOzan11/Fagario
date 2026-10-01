import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/ui/money";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { copy } from "@/content/copy";
import { formatMoney, formatPorcentaje } from "@/content/format";
import type { ConfigFiscal, ResultadoSemaforo } from "@/lib/domain/types";
import { TONO_NIVEL } from "./presenters";

export function umbralTicks(config: ConfigFiscal) {
  return [
    {
      value: config.umbralAmarillo,
      label: formatPorcentaje(config.umbralAmarillo),
    },
    { value: config.umbralRojo, label: formatPorcentaje(config.umbralRojo) },
  ];
}

export function teFaltanTexto(s: ResultadoSemaforo) {
  return s.excedido
    ? copy.semaforo.tePasaste(formatMoney(s.facturado - s.tope, "ARS"))
    : copy.semaforo.teFaltan(formatMoney(s.restante, "ARS"));
}

/** Tarjeta compacta del semáforo para el dashboard. */
export function SemaforoResumen({
  semaforo: s,
  config,
  headingId,
}: {
  semaforo: ResultadoSemaforo;
  config: ConfigFiscal;
  headingId: string;
}) {
  const tono = TONO_NIVEL[s.nivel];
  return (
    <div className="border-border bg-surface grid gap-6 rounded-lg border p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className="text-eyebrow text-muted-foreground">
          {copy.semaforo.titulo}
        </h2>
        <Badge variant={tono} dot>
          {copy.semaforo.categoria(s.categoria)}
        </Badge>
      </div>

      <div className="grid gap-2">
        <p className="text-heading text-balance">
          {copy.semaforo.tituloPorNivel[s.nivel]}
        </p>
        <p className="text-muted-foreground text-sm">
          {copy.semaforo.doceMesesLabel}
        </p>
      </div>

      <div className="grid gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <Money cents={s.facturado} size="lg" animate className="truncate" />
          <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
            {copy.semaforo.usado(formatPorcentaje(s.proporcion))}
          </span>
        </div>
        <ProgressMeter
          value={s.proporcion}
          tone={tono}
          ticks={umbralTicks(config)}
          label={copy.semaforo.ariaNivel[s.nivel]}
          valueText={copy.semaforo.llevas(
            formatMoney(s.facturado, "ARS"),
            formatMoney(s.tope, "ARS"),
          )}
        />
      </div>

      <p className="text-[0.9375rem] font-medium tabular-nums">
        {teFaltanTexto(s)}
      </p>

      <Link
        href="/semaforo"
        className="text-accent hover:text-accent-hover focus-visible:ring-ring -mx-2 -mb-2 inline-flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2"
      >
        {copy.semaforo.verDetalle}
        <ArrowRight
          weight="light"
          aria-hidden
          className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}

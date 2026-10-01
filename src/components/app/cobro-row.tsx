import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/ui/money";
import { copy } from "@/content/copy";
import { formatMoney } from "@/content/format";
import type { CobroConCliente } from "@/lib/domain/types";
import { aArs } from "@/lib/fiscal/moneda";
import { cn } from "@/lib/utils";
import { CobroAcciones } from "./cobro-acciones";
import { BADGE_ESTADO, fechaCobroTexto } from "./presenters";

type CobroRowProps = {
  cobro: CobroConCliente;
  hoy: string;
  /** ARS por 1 USD, para la estimación en pesos de cobros en dólares. */
  tipoCambio: number;
  /** Muestra el menú de acciones. */
  acciones?: boolean;
  className?: string;
};

/**
 * Fila de cobro: avatar + cliente/concepto · fecha relativa + estado · monto.
 * En mobile, la fecha y el estado bajan a una segunda línea.
 */
export function CobroRow({
  cobro,
  hoy,
  tipoCambio,
  acciones = false,
  className,
}: CobroRowProps) {
  const usd = cobro.moneda === "USD";
  const atrasado = cobro.estado === "atrasado";
  return (
    <li
      className={cn(
        "group relative isolate grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 py-4 sm:gap-y-1.5",
        // hover sutil que desborda apenas la columna, sin mover el contenido
        "before:bg-surface-muted before:absolute before:inset-x-[-0.75rem] before:inset-y-1 before:-z-10 before:rounded-md before:opacity-0 before:transition-opacity before:duration-150 hover:before:opacity-60",
        acciones && "grid-cols-[auto_minmax(0,1fr)_auto]",
        "sm:grid-cols-[auto_minmax(0,1fr)_12.5rem_9rem]",
        acciones && "sm:grid-cols-[auto_minmax(0,1fr)_12.5rem_9rem_auto]",
        className,
      )}
    >
      <Avatar
        name={cobro.cliente.nombre}
        className="row-span-3 self-start sm:row-span-1 sm:self-center"
      />

      <div className="col-start-2 row-start-1 min-w-0">
        <p className="text-foreground truncate text-[0.9375rem] font-medium">
          {cobro.cliente.nombre}
        </p>
        <p className="text-muted-foreground truncate text-sm">
          {cobro.concepto}
        </p>
      </div>

      <div className="col-start-2 row-start-3 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 sm:col-start-3 sm:row-start-1 sm:flex-col sm:items-start sm:gap-1">
        <Badge variant={BADGE_ESTADO[cobro.estado]} dot>
          {copy.cobros.estado[cobro.estado]}
        </Badge>
        <span
          className={cn(
            "text-xs sm:text-pretty",
            atrasado ? "text-danger-foreground" : "text-muted-foreground",
          )}
        >
          {fechaCobroTexto(cobro, hoy)}
        </span>
      </div>

      <div className="col-start-2 row-start-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 sm:col-start-4 sm:row-start-1 sm:grid sm:justify-items-end sm:text-right">
        <span className="flex items-baseline gap-1.5">
          {usd ? (
            <span className="bg-accent-soft text-accent rounded-sm px-1 text-[0.625rem] leading-4 font-medium tracking-wide">
              USD
            </span>
          ) : null}
          <Money
            cents={cobro.monto}
            currency={cobro.moneda}
            className="font-serif text-[1.375rem] leading-7 font-normal tracking-tight tabular-nums"
          />
        </span>
        {usd ? (
          <span className="text-subtle-foreground text-xs tabular-nums">
            {copy.cobros.estimadoEnPesos(
              formatMoney(aArs(cobro.monto, "USD", tipoCambio), "ARS"),
            )}
          </span>
        ) : null}
      </div>

      {acciones ? (
        <div className="col-start-3 row-span-3 row-start-1 -mr-2 self-start sm:col-start-5 sm:row-span-1 sm:mr-0 sm:self-center">
          <CobroAcciones cliente={cobro.cliente.nombre} />
        </div>
      ) : null}
    </li>
  );
}

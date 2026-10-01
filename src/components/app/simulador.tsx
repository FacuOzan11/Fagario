"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { ProgressMeter, type Tick } from "@/components/ui/progress-meter";
import { Skeleton } from "@/components/ui/skeleton";
import { copy } from "@/content/copy";
import { formatMoney, formatPorcentaje } from "@/content/format";
import type { Moneda } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import type { ResultadoSimulacion } from "@/app/(app)/semaforo/actions";
import { TONO_NIVEL } from "./presenters";

const DEBOUNCE_MS = 350;
const SIMBOLO: Record<Moneda, string> = { ARS: "$", USD: "US$" };

/** "1.500.000,50" -> 1500000.5 (formato es-AR). */
function parseMonto(raw: string): number {
  const limpio = raw.replace(/[^\d,]/g, "").replace(",", ".");
  return limpio ? Number(limpio) : 0;
}

type Props = {
  simular: (
    monto: number,
    moneda: Moneda,
  ) => Promise<ResultadoSimulacion | null>;
  ticks: Tick[];
  /** Centavos ARS: tope de la categoría actual. */
  tope: number;
};

export function Simulador({ simular, ticks, tope }: Props) {
  const s = copy.semaforo.simulador;
  const id = React.useId();
  const [raw, setRaw] = React.useState("");
  const [moneda, setMoneda] = React.useState<Moneda>("ARS");
  const [resultado, setResultado] = React.useState<ResultadoSimulacion | null>(
    null,
  );
  const [error, setError] = React.useState(false);
  const [cargando, setCargando] = React.useState(false);
  const pedido = React.useRef(0);

  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  /** Debounce: simula 350ms después del último cambio; descarta respuestas viejas. */
  function programar(nextRaw: string, nextMoneda: Moneda) {
    const monto = parseMonto(nextRaw);
    const n = ++pedido.current;
    window.clearTimeout(timer.current);
    setError(false);
    if (!(monto > 0)) {
      setResultado(null);
      setCargando(false);
      return;
    }
    setCargando(true);
    timer.current = window.setTimeout(async () => {
      try {
        const r = await simular(monto, nextMoneda);
        if (n !== pedido.current) return;
        setResultado(r);
        setError(r === null);
      } catch {
        if (n === pedido.current) setError(true);
      } finally {
        if (n === pedido.current) setCargando(false);
      }
    }, DEBOUNCE_MS);
  }

  return (
    <div className="border-border bg-surface grid gap-6 rounded-lg border p-6 sm:p-8">
      <div className="grid gap-1.5">
        <h2 id={`${id}-titulo`} className="text-heading">
          {s.titulo}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {s.descripcion}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="grid gap-2">
          <Label htmlFor={`${id}-monto`}>{s.montoLabel}</Label>
          <div className="relative">
            <span
              aria-hidden
              className="text-muted-foreground pointer-events-none absolute inset-y-0 left-4 flex items-center font-serif text-xl"
            >
              {SIMBOLO[moneda]}
            </span>
            <input
              id={`${id}-monto`}
              inputMode="decimal"
              autoComplete="off"
              placeholder={s.montoPlaceholder}
              value={raw}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d.,]/g, "");
                setRaw(v);
                programar(v, moneda);
              }}
              className={cn(
                "border-border-strong bg-surface text-foreground h-14 w-full min-w-0 rounded-md border pr-4 font-serif text-[1.75rem] tracking-tight tabular-nums",
                "placeholder:text-subtle-foreground hover:border-foreground/60 transition-[border-color,box-shadow] duration-150 outline-none",
                "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-2",
                moneda === "USD" ? "pl-16" : "pl-10",
              )}
            />
          </div>
        </div>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm leading-5 font-medium">
            {s.monedaLabel}
          </legend>
          <div className="bg-surface-muted grid h-14 grid-cols-2 rounded-md p-1 sm:inline-grid">
            {(["ARS", "USD"] as const).map((m) => (
              <label
                key={m}
                className={cn(
                  "relative flex min-w-16 cursor-pointer items-center justify-center rounded-sm px-4 text-sm font-medium transition-colors duration-150",
                  "has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-2",
                  moneda === m
                    ? "bg-surface text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <input
                  type="radio"
                  name={`${id}-moneda`}
                  value={m}
                  checked={moneda === m}
                  onChange={() => {
                    setMoneda(m);
                    programar(raw, m);
                  }}
                  className="sr-only"
                />
                {m}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div
        aria-live="polite"
        aria-busy={cargando}
        className="border-border min-h-40 border-t pt-6"
      >
        {cargando ? (
          <div className="grid gap-3">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-3 h-2 w-full rounded-full" />
          </div>
        ) : error ? (
          <p className="text-danger text-sm">{s.error}</p>
        ) : resultado ? (
          <ResultadoVista r={resultado} ticks={ticks} tope={tope} />
        ) : (
          <p className="text-muted-foreground text-sm">{s.vacio}</p>
        )}
      </div>
    </div>
  );
}

function ResultadoVista({
  r,
  ticks,
  tope,
}: {
  r: ResultadoSimulacion;
  ticks: Tick[];
  tope: number;
}) {
  const s = copy.semaforo.simulador;
  const { impacto: i } = r;
  const nivel = i.despues.nivel;
  const tono = TONO_NIVEL[nivel];
  const nombreNivel = copy.semaforo.nivel[nivel];

  let titulo: string;
  let cuerpo: string;
  if (i.superaTope && i.categoriaResultante) {
    const t = copy.alertas.pasa_de_categoria({
      categoriaNueva: i.categoriaResultante,
      cuotaNueva:
        r.cuotaNueva !== undefined
          ? formatMoney(r.cuotaNueva, "ARS")
          : undefined,
    });
    titulo = t.titulo;
    cuerpo = t.cuerpo;
  } else if (i.despues.excedido) {
    titulo = copy.semaforo.tituloPorNivel.rojo;
    cuerpo = copy.semaforo.tePasaste(
      formatMoney(i.despues.facturado - tope, "ARS"),
    );
  } else {
    titulo = i.cambiaNivel ? s.pasasA(nombreNivel) : s.seguis(nombreNivel);
    cuerpo = s.teQuedarian(formatMoney(i.restanteDespues, "ARS"));
  }

  return (
    <div className="animate-rise grid gap-5">
      <div className="grid gap-1.5">
        <p
          className={cn(
            "flex items-center gap-2.5 font-serif text-2xl leading-tight text-balance",
            tono === "danger" && "text-danger-foreground",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "size-2 shrink-0 rounded-full",
              tono === "ok"
                ? "bg-ok"
                : tono === "warn"
                  ? "bg-warn"
                  : "bg-danger",
            )}
          />
          {titulo}
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {cuerpo}
        </p>
      </div>
      <ProgressMeter
        value={i.despues.proporcion}
        tone={tono}
        ticks={ticks.map((t) => ({ value: t.value }))}
        label={s.titulo}
        valueText={s.quedariasEn(formatPorcentaje(i.despues.proporcion))}
      />
      <p className="text-muted-foreground text-xs tabular-nums">
        {s.quedariasEn(formatPorcentaje(i.despues.proporcion))}
      </p>
    </div>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ClockCountdown,
  Gauge,
  Receipt,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

import { copy, type TextoAlerta } from "@/content/copy";
import {
  formatFecha,
  formatFechaRelativa,
  formatMoney,
  formatPorcentaje,
  MESES_LARGOS,
} from "@/content/format";
import type {
  Alerta,
  Cliente,
  LetraCategoria,
  SeveridadAlerta,
  TipoAlerta,
} from "@/lib/domain/types";
import { sumarDias } from "@/lib/fiscal/fechas";
import { cn } from "@/lib/utils";

const ICONO: Record<TipoAlerta, Icon> = {
  recategorizacion: CalendarCheck,
  vencimiento_cuota: Receipt,
  cerca_del_tope: Gauge,
  excede_tope: WarningCircle,
  cobro_atrasado: ClockCountdown,
};

const TONO: Record<SeveridadAlerta, { icon: string; border: string }> = {
  info: { icon: "bg-accent-soft text-accent", border: "border-border" },
  warn: { icon: "bg-warn-soft text-warn-foreground", border: "border-border" },
  danger: {
    icon: "bg-danger-soft text-danger-foreground",
    border: "border-danger/35",
  },
};

/** Destino del CTA de cada alerta (si tiene uno en esta fase). */
const DESTINO: Partial<Record<TipoAlerta, string>> = {
  recategorizacion: "#categoria",
  excede_tope: "#categoria",
};

export interface ContextoAlerta {
  hoy: string;
  categoria: LetraCategoria;
  cuotaMensual: number;
  clientes: Pick<Cliente, "id" | "nombre">[];
}

/** Convierte una alerta del dominio en el texto de copy, con datos ya formateados. */
export function textoAlerta(a: Alerta, ctx: ContextoAlerta): TextoAlerta {
  const { hoy } = ctx;
  switch (a.tipo) {
    case "recategorizacion":
      return copy.alertas.recategorizacion({
        mesLargo: MESES_LARGOS[a.datos.mesRecategorizacion - 1],
        fechaLimite: formatFecha(a.datos.fechaLimite, hoy),
        enDias: formatFechaRelativa(a.datos.fechaLimite, hoy),
      });
    case "vencimiento_cuota":
      return copy.alertas.vencimiento_cuota({
        monto: formatMoney(a.datos.cuotaMensual ?? ctx.cuotaMensual, "ARS"),
        fecha: formatFecha(a.datos.fechaVencimiento, hoy),
        enDias: formatFechaRelativa(a.datos.fechaVencimiento, hoy),
      });
    case "cerca_del_tope":
      return copy.alertas.cerca_del_tope({
        porcentaje: formatPorcentaje(a.datos.proporcion),
        teFaltan: formatMoney(a.datos.restante, "ARS"),
        categoria: ctx.categoria,
      });
    case "excede_tope":
      return copy.alertas.excede_tope({
        excedente: formatMoney(a.datos.excedente, "ARS"),
        categoria: ctx.categoria,
        categoriaSiguiente: a.datos.categoriaCorrespondiente,
      });
    case "cobro_atrasado":
      return copy.alertas.cobro_atrasado({
        cliente:
          ctx.clientes.find((c) => c.id === a.datos.clienteId)?.nombre ?? "",
        monto: formatMoney(a.datos.monto, a.datos.moneda),
        hace: formatFechaRelativa(sumarDias(hoy, -a.datos.diasDeAtraso), hoy),
      });
  }
}

export function AlertaCard({
  alerta,
  contexto,
}: {
  alerta: Alerta;
  contexto: ContextoAlerta;
}) {
  const t = textoAlerta(alerta, contexto);
  const Icono = ICONO[alerta.tipo];
  const tono = TONO[alerta.severidad];
  const destino = DESTINO[alerta.tipo];
  return (
    <li
      className={cn(
        "bg-surface flex gap-4 rounded-lg border p-5 sm:p-6",
        tono.border,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          tono.icon,
        )}
      >
        <Icono weight="light" className="size-5" />
      </span>
      <div className="grid min-w-0 gap-1.5">
        <h3 className="text-base leading-snug font-medium text-balance">
          {t.titulo}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t.cuerpo}
        </p>
        {t.cta && destino ? (
          <Link
            href={destino}
            className="text-accent hover:text-accent-hover focus-visible:ring-ring -mx-1 mt-1 inline-flex min-h-11 w-fit items-center gap-1.5 rounded-sm px-1 text-sm font-medium outline-none focus-visible:ring-2 sm:min-h-8"
          >
            {t.cta}
            <ArrowRight weight="light" aria-hidden className="size-4" />
          </Link>
        ) : null}
      </div>
    </li>
  );
}

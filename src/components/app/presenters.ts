/** Helpers de presentación: dominio -> strings/tonos de UI. Puros, sin React. */
import { copy } from "@/content/copy";
import { diasEntre, formatFecha, formatMoney } from "@/content/format";
import type {
  CobroConCliente,
  EstadoCobro,
  Moneda,
  NivelSemaforo,
} from "@/lib/domain/types";

export type Tono = "ok" | "warn" | "danger";

export const TONO_NIVEL: Record<NivelSemaforo, Tono> = {
  verde: "ok",
  amarillo: "warn",
  rojo: "danger",
};

export const BADGE_ESTADO: Record<
  EstadoCobro,
  "neutral" | "ok" | "warn" | "danger"
> = {
  por_cobrar: "neutral",
  cobrado: "ok",
  atrasado: "danger",
};

/** "$ 538.000 + US$ 580" (omite monedas en cero). */
export function desgloseMonedas(
  porMoneda: Record<Moneda, number>,
): string | undefined {
  const partes = (Object.keys(porMoneda) as Moneda[])
    .filter((m) => porMoneda[m] !== 0)
    .map((m) => formatMoney(porMoneda[m], m));
  return partes.length > 1 || porMoneda.USD !== 0
    ? partes.join(" + ")
    : undefined;
}

/** "Vence en 3 días" / "Venció ayer" / "Cobrado el 12 de septiembre". */
export function fechaCobroTexto(
  c: Pick<CobroConCliente, "estado" | "fechaEsperada" | "fechaCobro">,
  hoy: string,
): string {
  if (c.estado === "cobrado")
    return copy.cobros.cobradoEl(
      formatFecha(c.fechaCobro ?? c.fechaEsperada, hoy),
    );
  const d = diasEntre(hoy, c.fechaEsperada);
  if (d === 0) return copy.cobros.venceHoy;
  return d > 0 ? copy.cobros.venceEn(d) : copy.cobros.vencio(-d);
}

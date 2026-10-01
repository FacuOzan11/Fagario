import type { Cobro, EstadoCobro } from "@/lib/domain/types";
import { diferenciaEnDias } from "./fechas";

/**
 * Estado efectivo de un cobro a la fecha `hoy`.
 * "atrasado" = no cobrado y con fechaEsperada estrictamente anterior a hoy.
 * Si vence hoy, todavía está "por_cobrar".
 */
export function estadoEfectivo(cobro: Pick<Cobro, "estado" | "fechaEsperada">, hoy: string): EstadoCobro {
  if (cobro.estado === "cobrado") return "cobrado";
  return cobro.fechaEsperada < hoy ? "atrasado" : "por_cobrar";
}

/** Días de atraso (0 si no está atrasado). */
export function diasDeAtraso(cobro: Pick<Cobro, "estado" | "fechaEsperada">, hoy: string): number {
  if (estadoEfectivo(cobro, hoy) !== "atrasado") return 0;
  return diferenciaEnDias(cobro.fechaEsperada, hoy);
}

/** Devuelve una copia del cobro con `estado` ya efectivo. */
export function conEstadoEfectivo<T extends Cobro>(cobro: T, hoy: string): T {
  return { ...cobro, estado: estadoEfectivo(cobro, hoy) };
}

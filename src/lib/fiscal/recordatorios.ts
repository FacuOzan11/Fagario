import type { Cobro, RecordatorioConfig, RecordatorioProgramado } from "@/lib/domain/types";
import { estadoEfectivo } from "./estado";
import { sumarDias } from "./fechas";

/**
 * Recordatorios de cobro: uno por cada día de `diasTrasVencimiento` contado
 * desde `fechaEsperada`. Solo lógica: no envía nada.
 * - cobro cobrado (o config inactiva) → "omitido"
 * - fecha <= hoy → "enviado_simulado"
 * - fecha > hoy → "pendiente"
 */
export function programarRecordatorios(
  cobro: Pick<Cobro, "id" | "estado" | "fechaEsperada">,
  config: RecordatorioConfig,
  hoy: string,
): RecordatorioProgramado[] {
  const cobrado = estadoEfectivo(cobro, hoy) === "cobrado";
  const dias = [...new Set(config.diasTrasVencimiento)].filter((d) => d >= 0).sort((a, b) => a - b);
  return dias.map((d) => {
    const fecha = sumarDias(cobro.fechaEsperada, d);
    const estado = cobrado || !config.activo ? "omitido" : fecha <= hoy ? "enviado_simulado" : "pendiente";
    return { id: `${cobro.id}-r${d}`, cobroId: cobro.id, fecha, diasTrasVencimiento: d, estado };
  });
}

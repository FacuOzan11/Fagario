import type { CategoriaMonotributo, Comprobante, ConfigFiscal } from "@/lib/domain/types";

/** Tabla chica y redonda para tests (no usar fuera de tests). */
export const TABLA_TEST: CategoriaMonotributo[] = [
  { letra: "A", topeAnual: 1_000_000, cuotaMensual: 10_000, vigenciaDesde: "2020-01-01", placeholder: true },
  { letra: "B", topeAnual: 2_000_000, cuotaMensual: 20_000, vigenciaDesde: "2020-01-01", placeholder: true },
  { letra: "C", topeAnual: 3_000_000, cuotaMensual: 30_000, vigenciaDesde: "2020-01-01", placeholder: true },
  { letra: "K", topeAnual: 10_000_000, cuotaMensual: 100_000, vigenciaDesde: "2020-01-01", placeholder: true },
];

export const CONFIG_TEST: ConfigFiscal = {
  umbralAmarillo: 0.75,
  umbralRojo: 0.9,
  porcentajeReserva: 0.05,
  tipoCambioReferencia: 1000,
  placeholder: true,
};

let n = 0;
export function comp(fecha: string, montoArs: number, extra: Partial<Comprobante> = {}): Comprobante {
  n++;
  return {
    id: `t${n}`,
    tipo: "C",
    puntoVenta: 1,
    numero: n,
    fecha,
    moneda: "ARS",
    montoOriginal: montoArs,
    tipoCambio: 1,
    montoArs,
    ...extra,
  };
}

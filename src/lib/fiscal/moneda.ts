import type { Moneda } from "@/lib/domain/types";

/**
 * Convierte centavos en `moneda` a centavos de ARS.
 * `tipoCambio` = ARS por 1 USD. Para ARS se ignora. Redondea al centavo.
 */
export function aArs(montoCents: number, moneda: Moneda, tipoCambio: number): number {
  if (moneda === "ARS") return Math.round(montoCents);
  if (!(tipoCambio > 0) || !Number.isFinite(tipoCambio)) {
    throw new Error(`Tipo de cambio inválido: ${tipoCambio}`);
  }
  return Math.round(montoCents * tipoCambio);
}

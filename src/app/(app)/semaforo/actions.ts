"use server";

import { categoriaVigente } from "@/lib/config/categorias";
import { getCategorias, getImpactoDeCobro, hoyISO } from "@/lib/data";
import type { ImpactoCobro, Moneda } from "@/lib/domain/types";

export interface ResultadoSimulacion {
  impacto: ImpactoCobro;
  /** Centavos ARS: cuota de la categoría a la que pasaría, si cambia de categoría. */
  cuotaNueva?: number;
}

const MAX_UNIDADES = 1_000_000_000_000;

/** Simula el impacto de un cobro (monto en unidades de `moneda`, no centavos). */
export async function simularCobro(monto: number, moneda: Moneda): Promise<ResultadoSimulacion | null> {
  if (typeof monto !== "number" || !Number.isFinite(monto) || monto <= 0 || monto > MAX_UNIDADES) return null;
  if (moneda !== "ARS" && moneda !== "USD") return null;

  const impacto = await getImpactoDeCobro(Math.round(monto * 100), moneda);
  let cuotaNueva: number | undefined;
  if (impacto.categoriaResultante) {
    try {
      cuotaNueva = categoriaVigente(await getCategorias(), impacto.categoriaResultante, hoyISO()).cuotaMensual;
    } catch {
      cuotaNueva = undefined;
    }
  }
  return { impacto, cuotaNueva };
}

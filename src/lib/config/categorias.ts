import type { CategoriaMonotributo, LetraCategoria } from "@/lib/domain/types";

/*
 * ============================================================================
 *  VALORES DE EJEMPLO — NO OFICIALES.
 *  Reemplazar por la tabla vigente de ARCA.
 *  En Fase 2 esto vive en la tabla `categorias_monotributo` de Supabase.
 * ============================================================================
 *
 *  Montos en centavos de ARS. Actividad: servicios.
 *  Órdenes de magnitud plausibles para 2026, pero NO son los valores reales:
 *  no usar para asesorar a nadie.
 *
 *  La tabla es versionada por `vigenciaDesde`: puede contener varias filas por
 *  letra; `categoriaVigente()` elige la más reciente cuya vigencia ya empezó.
 */

const ARS = (pesos: number) => Math.round(pesos * 100);
// Placeholder: vigencia abierta para que la app funcione con cualquier fecha en desarrollo.
// Las filas reales llevan la fecha de vigencia publicada por ARCA.
const VIGENCIA = "2000-01-01";

const filas: Array<[LetraCategoria, number, number]> = [
  // letra, tope anual (ARS), cuota mensual servicios (ARS)
  ["A", 10_000_000, 42_000],
  ["B", 14_600_000, 48_000],
  ["C", 20_400_000, 56_000],
  ["D", 25_300_000, 72_000],
  ["E", 29_800_000, 105_000],
  ["F", 37_300_000, 135_000],
  ["G", 44_600_000, 165_000],
  ["H", 67_800_000, 390_000],
  ["I", 75_900_000, 620_000],
  ["J", 86_900_000, 760_000],
  ["K", 95_000_000, 900_000],
];

export const CATEGORIAS_MONOTRIBUTO: CategoriaMonotributo[] = filas.map(
  ([letra, tope, cuota]) => ({
    letra,
    topeAnual: ARS(tope),
    cuotaMensual: ARS(cuota),
    vigenciaDesde: VIGENCIA,
    placeholder: true,
  }),
);

export const LETRAS_CATEGORIA: LetraCategoria[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K",
];

/**
 * Fila vigente para `letra` a la fecha `hoy`: la de mayor `vigenciaDesde` <= hoy.
 * Lanza si no hay ninguna (la tabla de configuración está incompleta).
 */
export function categoriaVigente(
  tabla: CategoriaMonotributo[],
  letra: LetraCategoria,
  hoy: string,
): CategoriaMonotributo {
  let mejor: CategoriaMonotributo | undefined;
  for (const fila of tabla) {
    if (fila.letra !== letra || fila.vigenciaDesde > hoy) continue;
    if (!mejor || fila.vigenciaDesde > mejor.vigenciaDesde) mejor = fila;
  }
  if (!mejor) {
    throw new Error(`No hay categoría ${letra} vigente al ${hoy} en la tabla de configuración`);
  }
  return mejor;
}

/** Todas las categorías vigentes a `hoy`, ordenadas de A a K (omite letras sin fila vigente). */
export function tablaVigente(
  tabla: CategoriaMonotributo[],
  hoy: string,
): CategoriaMonotributo[] {
  const out: CategoriaMonotributo[] = [];
  for (const letra of LETRAS_CATEGORIA) {
    const tieneFila = tabla.some((f) => f.letra === letra && f.vigenciaDesde <= hoy);
    if (tieneFila) out.push(categoriaVigente(tabla, letra, hoy));
  }
  return out;
}

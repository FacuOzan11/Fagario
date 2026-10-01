/**
 * Helpers de formato es-AR para toda la UI de Tope.
 *
 * Decisiones (ver docs/voz.md):
 * - Moneda: "$ 1.234.567" para pesos, "US$ 1.234" para dólares. Sin decimales por defecto
 *   (redondeo al entero); `decimals: 2` muestra centavos con coma: "$ 1.234,50".
 *   Entre símbolo y número va un espacio duro (U+00A0) para que nunca se corte la línea.
 * - Porcentaje: pegado al número, "82%" (como se lee en Argentina en apps y bancos).
 * - Fechas ISO "YYYY-MM-DD" se interpretan como fechas calendario en UTC: nunca se corren
 *   un día por zona horaria.
 * - Formateo manual (sin Intl) para que el resultado sea idéntico en servidor, navegador y tests.
 */

import type { Moneda } from "@/lib/domain/types";

export const NBSP = " ";

export const MESES_LARGOS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

export const MESES_CORTOS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

const SIMBOLO: Record<Moneda, string> = { ARS: "$", USD: "US$" };

/** Agrupa miles con punto: "1234567" -> "1.234.567". */
function agruparMiles(entero: string): string {
  return entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Formatea un número (no centavos) con separadores es-AR. */
export function formatNumero(valor: number, decimals = 0): string {
  const negativo = valor < 0;
  const fijo = Math.abs(valor).toFixed(decimals);
  const [entero, dec] = fijo.split(".");
  const cuerpo = agruparMiles(entero) + (dec ? `,${dec}` : "");
  return (negativo && Number(fijo) !== 0 ? "-" : "") + cuerpo;
}

/**
 * Centavos enteros -> "$ 1.234.567" / "US$ 1.234".
 * Negativos: "-$ 1.234".
 */
export function formatMoney(
  cents: number,
  moneda: Moneda,
  { decimals = 0 }: { decimals?: 0 | 2 } = {},
): string {
  const unidades = cents / 100;
  const numero = formatNumero(Math.abs(unidades), decimals);
  const negativo = unidades < 0 && numero.replace(/[0.,]/g, "") !== "";
  return `${negativo ? "-" : ""}${SIMBOLO[moneda]}${NBSP}${numero}`;
}

/** 0.82 -> "82%". `decimals` opcional: 0.825 -> "82,5%". */
export function formatPorcentaje(proporcion: number, { decimals = 0 }: { decimals?: number } = {}): string {
  return `${formatNumero(proporcion * 100, decimals)}%`;
}

// ---------- Fechas ----------

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})/;

/** "2026-10-15" -> ms UTC de esa fecha calendario. */
function isoAUtc(iso: string): number {
  const m = ISO_RE.exec(iso);
  if (!m) throw new Error(`Fecha ISO inválida: ${iso}`);
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Fecha de hoy en Argentina como "YYYY-MM-DD" (para usar como `hoy` por defecto). */
export function hoyISO(ahora: Date = new Date()): string {
  // Argentina es UTC-3 todo el año (sin horario de verano).
  const ar = new Date(ahora.getTime() - 3 * 60 * 60 * 1000);
  return ar.toISOString().slice(0, 10);
}

/**
 * "2026-10-15" -> "15 de octubre". Si el año no es el de `hoy`, lo agrega:
 * "15 de octubre de 2025".
 */
export function formatFecha(iso: string, hoy: string = hoyISO()): string {
  const d = new Date(isoAUtc(iso));
  const anioHoy = new Date(isoAUtc(hoy)).getUTCFullYear();
  const base = `${d.getUTCDate()} de ${MESES_LARGOS[d.getUTCMonth()]}`;
  return d.getUTCFullYear() === anioHoy ? base : `${base} de ${d.getUTCFullYear()}`;
}

/** Días calendario entre `hoy` y `iso` (positivo = futuro). */
export function diasEntre(hoy: string, iso: string): number {
  return Math.round((isoAUtc(iso) - isoAUtc(hoy)) / 86_400_000);
}

/** "hoy", "mañana", "ayer", "en 3 días", "hace 2 días". */
export function formatFechaRelativa(iso: string, hoy: string = hoyISO()): string {
  const dias = diasEntre(hoy, iso);
  if (dias === 0) return "hoy";
  if (dias === 1) return "mañana";
  if (dias === -1) return "ayer";
  return dias > 0 ? `en ${dias} días` : `hace ${-dias} días`;
}

/** "2026-03" (o "2026-03-15") -> "marzo" (largo) / "mar" (corto). */
export function formatMes(yyyyMm: string, estilo: "largo" | "corto" = "largo"): string {
  const m = /^(\d{4})-(\d{2})/.exec(yyyyMm);
  if (!m) throw new Error(`Mes inválido: ${yyyyMm}`);
  const idx = Number(m[2]) - 1;
  if (idx < 0 || idx > 11) throw new Error(`Mes inválido: ${yyyyMm}`);
  return estilo === "corto" ? MESES_CORTOS[idx] : MESES_LARGOS[idx];
}

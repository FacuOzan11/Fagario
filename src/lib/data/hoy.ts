/** Zona horaria de referencia del producto. */
export const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

/**
 * Fecha de hoy (ISO "YYYY-MM-DD") en hora de Argentina.
 * Único lugar de la app que lee el reloj; toda la lógica recibe `hoy` por parámetro.
 * `TOPE_HOY` (env) permite fijar la fecha para demos/tests e2e.
 */
export function hoyISO(ahora: Date = new Date()): string {
  const fijo = typeof process !== "undefined" ? process.env.TOPE_HOY : undefined;
  if (fijo && /^\d{4}-\d{2}-\d{2}$/.test(fijo)) return fijo;
  // en-CA formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
}

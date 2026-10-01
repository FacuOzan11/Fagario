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

/** Hora actual (0–23) en Argentina, para el saludo. Respeta `TOPE_HORA` (env) en demos/tests. */
export function horaAR(ahora: Date = new Date()): number {
  const env = typeof process !== "undefined" ? process.env.TOPE_HORA : undefined;
  if (env && /^\d{1,2}$/.test(env) && Number(env) <= 23) return Number(env);
  const h = new Intl.DateTimeFormat("en-GB", { timeZone: ZONA_HORARIA, hour: "2-digit", hourCycle: "h23" }).format(ahora);
  return Number(h) % 24;
}

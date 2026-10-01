/**
 * Helpers de fechas ISO "YYYY-MM-DD" sin dependencias.
 * Todo se calcula en UTC puro (Date.UTC) para no depender de la zona horaria del proceso.
 */

const RE_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_DIA = 86_400_000;

export interface PartesFecha {
  anio: number;
  /** 1–12 */
  mes: number;
  dia: number;
}

export function parseISO(fecha: string): PartesFecha {
  const m = RE_ISO.exec(fecha);
  if (!m) throw new Error(`Fecha ISO inválida: ${fecha}`);
  const anio = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > diasEnMes(anio, mes)) {
    throw new Error(`Fecha ISO inválida: ${fecha}`);
  }
  return { anio, mes, dia };
}

export function esFechaISO(fecha: string): boolean {
  try {
    parseISO(fecha);
    return true;
  } catch {
    return false;
  }
}

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

export function aISO(anio: number, mes: number, dia: number): string {
  return `${pad(anio, 4)}-${pad(mes)}-${pad(dia)}`;
}

export function esBisiesto(anio: number): boolean {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
}

export function diasEnMes(anio: number, mes: number): number {
  return [31, esBisiesto(anio) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mes - 1];
}

function aEpochDias(fecha: string): number {
  const { anio, mes, dia } = parseISO(fecha);
  return Date.UTC(anio, mes - 1, dia) / MS_DIA;
}

function desdeEpochDias(dias: number): string {
  const d = new Date(dias * MS_DIA);
  return aISO(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function sumarDias(fecha: string, dias: number): string {
  return desdeEpochDias(aEpochDias(fecha) + dias);
}

/**
 * Suma meses. Si el día no existe en el mes destino, se ajusta al último día
 * (ej. 2024-01-31 + 1 mes = 2024-02-29; 2024-02-29 - 12 meses = 2023-02-28).
 */
export function sumarMeses(fecha: string, meses: number): string {
  const { anio, mes, dia } = parseISO(fecha);
  const total = anio * 12 + (mes - 1) + meses;
  const nAnio = Math.floor(total / 12);
  const nMes = total - nAnio * 12 + 1;
  return aISO(nAnio, nMes, Math.min(dia, diasEnMes(nAnio, nMes)));
}

export function inicioDeMes(fecha: string): string {
  const { anio, mes } = parseISO(fecha);
  return aISO(anio, mes, 1);
}

export function finDeMes(fecha: string): string {
  const { anio, mes } = parseISO(fecha);
  return aISO(anio, mes, diasEnMes(anio, mes));
}

/** Días de `desde` a `hasta` (positivo si hasta es posterior). */
export function diferenciaEnDias(desde: string, hasta: string): number {
  return aEpochDias(hasta) - aEpochDias(desde);
}

/** "YYYY-MM" de una fecha ISO. */
export function mesISO(fecha: string): string {
  parseISO(fecha);
  return fecha.slice(0, 7);
}

/** Fecha dentro del rango [desde, hasta], ambos inclusive. */
export function enRango(fecha: string, desde: string, hasta: string): boolean {
  return fecha >= desde && fecha <= hasta;
}

/**
 * Ventana de 12 meses móviles que termina en `hoy` (inclusive).
 * Empieza el día siguiente a "hoy menos 12 meses": un comprobante de hace
 * exactamente 12 meses queda AFUERA.
 */
export function ventana12Meses(hoy: string): { desde: string; hasta: string } {
  return { desde: sumarDias(sumarMeses(hoy, -12), 1), hasta: hoy };
}

/** Los últimos `n` meses calendario ("YYYY-MM") terminando en el mes de `hoy`, del más viejo al actual. */
export function ultimosMeses(hoy: string, n: number): string[] {
  const base = inicioDeMes(hoy);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(mesISO(sumarMeses(base, -i)));
  return out;
}

export function maxFecha(a: string, b: string): string {
  return a > b ? a : b;
}

export function minFecha(a: string, b: string): string {
  return a < b ? a : b;
}

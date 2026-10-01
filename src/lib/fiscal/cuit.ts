/** Validación de CUIT/CUIL argentino (módulo 11). Acepta "20-12345678-9" o "20123456789". */

const PESOS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
const PREFIJOS = new Set(["20", "23", "24", "25", "26", "27", "30", "33", "34"]);

export function normalizarCuit(cuit: string): string {
  return cuit.replace(/[\s-]/g, "");
}

/**
 * Dígito verificador para los 10 primeros dígitos. Devuelve null si el resultado
 * es 10 (combinación inválida: ARCA asigna otro prefijo, ej. 23).
 */
export function digitoVerificadorCuit(diezDigitos: string): number | null {
  if (!/^\d{10}$/.test(diezDigitos)) throw new Error("Se esperan 10 dígitos");
  const suma = PESOS.reduce((acc, p, i) => acc + p * Number(diezDigitos[i]), 0);
  const dv = 11 - (suma % 11);
  if (dv === 11) return 0;
  if (dv === 10) return null;
  return dv;
}

export function validarCuit(cuit: string): boolean {
  const n = normalizarCuit(cuit);
  if (!/^\d{11}$/.test(n)) return false;
  if (!PREFIJOS.has(n.slice(0, 2))) return false;
  const dv = digitoVerificadorCuit(n.slice(0, 10));
  return dv !== null && dv === Number(n[10]);
}

export function formatearCuit(cuit: string): string {
  const n = normalizarCuit(cuit);
  return `${n.slice(0, 2)}-${n.slice(2, 10)}-${n.slice(10)}`;
}

/**
 * Arma un CUIT válido con prefijo y número (8 dígitos). Si el dígito daría 10,
 * incrementa el número hasta obtener uno válido. Útil para seeds/tests.
 */
export function construirCuit(prefijo: string, numero: number): string {
  for (let n = numero; ; n++) {
    const cuerpo = `${prefijo}${String(n).padStart(8, "0")}`;
    const dv = digitoVerificadorCuit(cuerpo);
    if (dv !== null) return formatearCuit(`${cuerpo}${dv}`);
  }
}

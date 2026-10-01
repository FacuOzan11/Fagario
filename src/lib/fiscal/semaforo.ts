import type {
  CategoriaMonotributo,
  Comprobante,
  ConfigFiscal,
  LetraCategoria,
  NivelSemaforo,
  ResultadoSemaforo,
} from "@/lib/domain/types";
import { categoriaVigente, LETRAS_CATEGORIA, tablaVigente } from "@/lib/config/categorias";
import { enRango, mesISO, ultimosMeses, ventana12Meses } from "./fechas";

/** Suma `montoArs` de los comprobantes dentro de los 12 meses móviles que terminan en `hoy` (inclusive). */
export function facturacion12Meses(comprobantes: Comprobante[], hoy: string): number {
  const { desde, hasta } = ventana12Meses(hoy);
  let total = 0;
  for (const c of comprobantes) if (enRango(c.fecha, desde, hasta)) total += c.montoArs;
  return total;
}

/** Nivel según umbrales: proporción >= umbral → nivel superior. */
export function nivelPorProporcion(proporcion: number, config: ConfigFiscal): NivelSemaforo {
  if (proporcion >= config.umbralRojo) return "rojo";
  if (proporcion >= config.umbralAmarillo) return "amarillo";
  return "verde";
}

export function letraSiguiente(letra: LetraCategoria): LetraCategoria | undefined {
  const i = LETRAS_CATEGORIA.indexOf(letra);
  return LETRAS_CATEGORIA[i + 1];
}

/** Categoría más baja (vigente a `hoy`) cuyo tope cubre `facturado`. undefined si supera la máxima. */
export function categoriaParaFacturacion(
  facturado: number,
  tabla: CategoriaMonotributo[],
  hoy: string,
): LetraCategoria | undefined {
  return tablaVigente(tabla, hoy).find((c) => c.topeAnual >= facturado)?.letra;
}

/** Facturación por mes calendario para los 12 meses que terminan en el mes de `hoy`. */
export function serieMensual(comprobantes: Comprobante[], hoy: string) {
  const meses = ultimosMeses(hoy, 12);
  const porMes = new Map(meses.map((m) => [m, 0]));
  for (const c of comprobantes) {
    if (c.fecha > hoy) continue;
    const m = mesISO(c.fecha);
    const v = porMes.get(m);
    if (v !== undefined) porMes.set(m, v + c.montoArs);
  }
  return meses.map((mes) => ({ mes, montoArs: porMes.get(mes) ?? 0 }));
}

export interface EntradaSemaforo {
  comprobantes: Comprobante[];
  categoria: LetraCategoria;
  tablaCategorias: CategoriaMonotributo[];
  config: ConfigFiscal;
  hoy: string;
}

export function calcularSemaforo({
  comprobantes,
  categoria,
  tablaCategorias,
  config,
  hoy,
}: EntradaSemaforo): ResultadoSemaforo {
  const tope = categoriaVigente(tablaCategorias, categoria, hoy).topeAnual;
  const facturado = facturacion12Meses(comprobantes, hoy);
  const proporcion = tope > 0 ? facturado / tope : 0;
  return {
    categoria,
    facturado,
    tope,
    restante: Math.max(0, tope - facturado),
    proporcion,
    nivel: nivelPorProporcion(proporcion, config),
    categoriaSiguiente: letraSiguiente(categoria),
    categoriaCorrespondiente: categoriaParaFacturacion(facturado, tablaCategorias, hoy),
    excedido: facturado > tope,
    serieMensual: serieMensual(comprobantes, hoy),
    ventana: ventana12Meses(hoy),
  };
}

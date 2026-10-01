import type { ImpactoCobro } from "@/lib/domain/types";
import { categoriaVigente, LETRAS_CATEGORIA } from "@/lib/config/categorias";
import { categoriaParaFacturacion, facturacion12Meses, nivelPorProporcion, type EntradaSemaforo } from "./semaforo";

export interface EntradaImpacto extends EntradaSemaforo {
  /** Centavos ARS del cobro a simular (convertir antes con `aArs` si es USD). */
  montoArs: number;
}

/**
 * Simula sumar un cobro a la facturación de 12 meses: ¿cambia el nivel del
 * semáforo? ¿supera el tope ("este cobro te pasa de categoría")?
 */
export function impactoDeCobro({
  montoArs,
  comprobantes,
  categoria,
  tablaCategorias,
  config,
  hoy,
}: EntradaImpacto): ImpactoCobro {
  const tope = categoriaVigente(tablaCategorias, categoria, hoy).topeAnual;
  const fAntes = facturacion12Meses(comprobantes, hoy);
  const fDespues = fAntes + montoArs;
  const estado = (f: number) => {
    const proporcion = tope > 0 ? f / tope : 0;
    return { facturado: f, proporcion, nivel: nivelPorProporcion(proporcion, config), excedido: f > tope };
  };
  const antes = estado(fAntes);
  const despues = estado(fDespues);
  const superaTope = !antes.excedido && despues.excedido;
  const resultante = despues.excedido ? categoriaParaFacturacion(fDespues, tablaCategorias, hoy) : undefined;
  return {
    montoArs,
    antes,
    despues,
    cambiaNivel: antes.nivel !== despues.nivel,
    superaTope,
    categoriaResultante:
      resultante && LETRAS_CATEGORIA.indexOf(resultante) > LETRAS_CATEGORIA.indexOf(categoria) ? resultante : undefined,
    excedeCategoriaMaxima: despues.excedido && resultante === undefined,
    restanteDespues: Math.max(0, tope - fDespues),
  };
}

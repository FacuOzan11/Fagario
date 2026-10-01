import type { CategoriaMonotributo, ConfigFiscal, DesgloseReserva } from "@/lib/domain/types";

export interface EntradaReserva {
  /** Centavos ARS cobrados en el mes. */
  cobradoMesArs: number;
  categoria: Pick<CategoriaMonotributo, "cuotaMensual">;
  config: Pick<ConfigFiscal, "porcentajeReserva">;
}

/** Cuánto apartar este mes: cuota mensual + porcentajeReserva × cobrado. */
export function reservaImpuestos({ cobradoMesArs, categoria, config }: EntradaReserva): DesgloseReserva {
  const cobrado = Math.max(0, cobradoMesArs);
  const reservaAdicional = Math.round(cobrado * config.porcentajeReserva);
  return {
    cobradoMesArs: cobrado,
    cuotaMensual: categoria.cuotaMensual,
    porcentajeReserva: config.porcentajeReserva,
    reservaAdicional,
    total: categoria.cuotaMensual + reservaAdicional,
  };
}

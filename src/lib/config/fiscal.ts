import type { ConfigFiscal, RecordatorioConfig } from "@/lib/domain/types";

/*
 * ============================================================================
 *  VALORES DE EJEMPLO — NO OFICIALES.
 *  Umbrales, % de reserva y tipo de cambio de referencia son placeholders de
 *  desarrollo. En Fase 2 viven en Supabase y son editables.
 * ============================================================================
 */
export const CONFIG_FISCAL: ConfigFiscal = {
  umbralAmarillo: 0.75,
  umbralRojo: 0.9,
  porcentajeReserva: 0.05,
  /** ARS por 1 USD (placeholder). */
  tipoCambioReferencia: 1450,
  placeholder: true,
  diaLimiteRecategorizacion: 20,
  diasAvisoVencimientoCuota: 7,
};

export const DIA_LIMITE_RECATEGORIZACION_DEFAULT = 20;
export const DIAS_AVISO_VENCIMIENTO_DEFAULT = 7;

export const RECORDATORIO_CONFIG: RecordatorioConfig = {
  activo: true,
  diasTrasVencimiento: [3, 7, 15],
};

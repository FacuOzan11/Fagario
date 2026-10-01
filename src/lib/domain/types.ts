/**
 * Contrato del dominio de Tope. Todas las capas (mock, Supabase, UI) hablan estos tipos.
 * Montos: SIEMPRE enteros en centavos de la moneda indicada. Fechas: ISO "YYYY-MM-DD".
 */

export type Moneda = "ARS" | "USD";

export type EstadoCobro = "por_cobrar" | "cobrado" | "atrasado";

export type TipoCliente = "local" | "exterior";

export type LetraCategoria = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";

export type NivelSemaforo = "verde" | "amarillo" | "rojo";

export type TipoComprobante = "C" | "E";

export interface Cliente {
  id: string;
  nombre: string;
  tipo: TipoCliente;
  /** Código ISO 3166-1 alfa-2, ej. "AR", "US". */
  pais: string;
  /** Solo clientes locales. */
  cuit?: string;
  email?: string;
}

export interface Cobro {
  id: string;
  clienteId: string;
  concepto: string;
  /** Centavos en `moneda`. */
  monto: number;
  moneda: Moneda;
  fechaEsperada: string;
  /** Presente solo si estado === "cobrado". */
  fechaCobro?: string;
  /** Estado persistido. "atrasado" se deriva con `estadoEfectivo()` en lib/fiscal. */
  estado: EstadoCobro;
  /** Comprobante emitido para este cobro, si existe. */
  comprobanteId?: string;
}

/** Factura emitida (o importada del CSV de "Mis Comprobantes" de ARCA). Es lo que cuenta para el tope. */
export interface Comprobante {
  id: string;
  tipo: TipoComprobante;
  puntoVenta: number;
  numero: number;
  fecha: string;
  clienteId?: string;
  moneda: Moneda;
  /** Centavos en `moneda`. */
  montoOriginal: number;
  /** Tipo de cambio ARS por 1 USD usado (1 si es ARS). */
  tipoCambio: number;
  /** Centavos de ARS: lo que suma a la facturación del monotributo. */
  montoArs: number;
  cae?: string;
}

/**
 * Fila de la tabla de configuración de categorías. Editable, versionada por vigencia.
 * NUNCA hardcodear estos valores en la lógica.
 */
export interface CategoriaMonotributo {
  letra: LetraCategoria;
  /** Centavos de ARS: ingresos brutos anuales máximos. */
  topeAnual: number;
  /** Centavos de ARS: cuota mensual total (impositivo + jubilación + obra social), servicios. */
  cuotaMensual: number;
  vigenciaDesde: string;
  /** true = valor de ejemplo para desarrollo, no oficial. */
  placeholder: boolean;
}

export interface PerfilFiscal {
  nombre: string;
  cuit: string;
  categoria: LetraCategoria;
  actividad: "servicios" | "bienes";
  /** Día del mes en que vence la cuota. */
  diaVencimientoCuota: number;
}

export interface ConfigFiscal {
  /** Proporción del tope (0–1) desde la que el semáforo pasa a amarillo. */
  umbralAmarillo: number;
  /** Proporción del tope (0–1) desde la que el semáforo pasa a rojo. */
  umbralRojo: number;
  /** % extra a apartar por mes sobre lo cobrado (ej. IIBB), 0–1. */
  porcentajeReserva: number;
  /** ARS por 1 USD para estimar cobros pendientes en USD. */
  tipoCambioReferencia: number;
  placeholder: boolean;
}

export interface RecordatorioConfig {
  activo: boolean;
  /** Días después del vencimiento, ej. [3, 7, 15]. */
  diasTrasVencimiento: number[];
}

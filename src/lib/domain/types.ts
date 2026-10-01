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
  /** Día del mes (enero/julio) que se usa como fecha límite de recategorización. Default 20. */
  diaLimiteRecategorizacion?: number;
  /** Días de anticipación para avisar el vencimiento de la cuota. Default 7. */
  diasAvisoVencimientoCuota?: number;
}

export interface RecordatorioConfig {
  activo: boolean;
  /** Días después del vencimiento, ej. [3, 7, 15]. */
  diasTrasVencimiento: number[];
}

// ---------------------------------------------------------------------------
// Tipos derivados (salidas de lib/fiscal y lib/data). Sin textos de UI.
// ---------------------------------------------------------------------------

/** Cobro con su estado efectivo (incluye "atrasado") y el cliente embebido. */
export interface CobroConCliente extends Cobro {
  cliente: Cliente;
}

export interface PuntoSerieMensual {
  /** "YYYY-MM" */
  mes: string;
  /** Centavos de ARS facturados en ese mes calendario. */
  montoArs: number;
}

export interface ResultadoSemaforo {
  categoria: LetraCategoria;
  /** Centavos ARS facturados en los últimos 12 meses móviles. */
  facturado: number;
  /** Centavos ARS: tope anual de la categoría vigente. */
  tope: number;
  /** Centavos ARS: max(0, tope - facturado). */
  restante: number;
  /** facturado / tope (puede ser > 1). */
  proporcion: number;
  nivel: NivelSemaforo;
  /** Letra inmediatamente superior a la actual (undefined si es K). */
  categoriaSiguiente?: LetraCategoria;
  /** Categoría más baja cuyo tope cubre lo facturado (undefined si supera la máxima). */
  categoriaCorrespondiente?: LetraCategoria;
  /** true si facturado > tope. */
  excedido: boolean;
  /** 12 meses calendario, del más viejo al actual. */
  serieMensual: PuntoSerieMensual[];
  /** Ventana usada (inclusive en ambos extremos). */
  ventana: { desde: string; hasta: string };
}

export interface ImpactoCobro {
  montoArs: number;
  antes: { facturado: number; proporcion: number; nivel: NivelSemaforo; excedido: boolean };
  despues: { facturado: number; proporcion: number; nivel: NivelSemaforo; excedido: boolean };
  cambiaNivel: boolean;
  /** true si antes no superaba el tope y con este cobro sí ("este cobro te pasa de categoría"). */
  superaTope: boolean;
  /** Categoría a la que pasaría (la más baja cuyo tope cubre lo facturado), si supera el tope. */
  categoriaResultante?: LetraCategoria;
  /** true si supera incluso el tope de la categoría máxima. */
  excedeCategoriaMaxima: boolean;
  /** Centavos ARS que quedan antes de superar el tope tras este cobro (>= 0). */
  restanteDespues: number;
}

export type TipoAlerta =
  | "recategorizacion"
  | "vencimiento_cuota"
  | "cerca_del_tope"
  | "excede_tope"
  | "cobro_atrasado";

export type SeveridadAlerta = "info" | "warn" | "danger";

interface AlertaBase<T extends TipoAlerta, D> {
  /** Determinístico: estable entre renders para el mismo `hoy`. */
  id: string;
  tipo: T;
  severidad: SeveridadAlerta;
  fecha?: string;
  datos: D;
}

export type Alerta =
  | AlertaBase<
      "recategorizacion",
      {
        /** Mes de recategorización: 1 (enero) o 7 (julio). */
        mesRecategorizacion: 1 | 7;
        fechaLimite: string;
        diasRestantes: number;
        categoriaActual: LetraCategoria;
        categoriaCorrespondiente?: LetraCategoria;
        facturado: number;
      }
    >
  | AlertaBase<
      "vencimiento_cuota",
      { fechaVencimiento: string; diasRestantes: number; cuotaMensual?: number }
    >
  | AlertaBase<
      "cerca_del_tope",
      { proporcion: number; restante: number; tope: number; nivel: NivelSemaforo }
    >
  | AlertaBase<
      "excede_tope",
      { facturado: number; tope: number; excedente: number; categoriaCorrespondiente?: LetraCategoria }
    >
  | AlertaBase<
      "cobro_atrasado",
      { cobroId: string; clienteId: string; monto: number; moneda: Moneda; diasDeAtraso: number }
    >;

export interface DesgloseReserva {
  /** Centavos ARS cobrados en el mes. */
  cobradoMesArs: number;
  /** Centavos ARS: cuota mensual de la categoría. */
  cuotaMensual: number;
  porcentajeReserva: number;
  /** Centavos ARS: porcentajeReserva × cobrado (redondeado). */
  reservaAdicional: number;
  /** Centavos ARS: cuota + adicional. */
  total: number;
}

export type EstadoRecordatorio = "pendiente" | "enviado_simulado" | "omitido";

export interface RecordatorioProgramado {
  id: string;
  cobroId: string;
  fecha: string;
  diasTrasVencimiento: number;
  estado: EstadoRecordatorio;
}

/** Monto agregado: total estimado en ARS + desglose en moneda original. Centavos. */
export interface MontoAgregado {
  ars: number;
  porMoneda: Record<Moneda, number>;
  cantidad: number;
}

export interface Dashboard {
  hoy: string;
  cobradoMes: MontoAgregado;
  porCobrar: MontoAgregado;
  atrasado: MontoAgregado;
  reserva: DesgloseReserva;
  proximosCobros: CobroConCliente[];
}

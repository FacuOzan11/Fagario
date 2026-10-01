/**
 * Capa de acceso a datos de Tope. Firmas estables: hoy lee del seed en memoria;
 * en Fase 2 leerá de Supabase sin cambiar estas firmas.
 * Sin APIs de navegador: apta para Server Components.
 */
import type {
  Alerta,
  CategoriaMonotributo,
  Cliente,
  CobroConCliente,
  Comprobante,
  ConfigFiscal,
  Dashboard,
  EstadoCobro,
  ImpactoCobro,
  Moneda,
  MontoAgregado,
  PerfilFiscal,
  RecordatorioConfig,
  RecordatorioProgramado,
  ResultadoSemaforo,
} from "@/lib/domain/types";
import { categoriaVigente } from "@/lib/config/categorias";
import { RECORDATORIO_CONFIG } from "@/lib/config/fiscal";
import { generarAlertas } from "@/lib/fiscal/alertas";
import { estadoEfectivo } from "@/lib/fiscal/estado";
import { mesISO } from "@/lib/fiscal/fechas";
import { aArs } from "@/lib/fiscal/moneda";
import { programarRecordatorios } from "@/lib/fiscal/recordatorios";
import { reservaImpuestos } from "@/lib/fiscal/reserva";
import { calcularSemaforo } from "@/lib/fiscal/semaforo";
import { impactoDeCobro } from "@/lib/fiscal/simulacion";
import { generarSeed, type Seed } from "@/lib/mock/seed";
import { hoyISO } from "./hoy";

export { hoyISO } from "./hoy";

const MAX_PROXIMOS = 6;

// Cache del seed por fecha (el seed es relativo a `hoy`).
let cache: Seed | undefined;
function db(hoy = hoyISO()): Seed {
  if (!cache || cache.hoy !== hoy) cache = generarSeed(hoy);
  return cache;
}

export interface FiltroCobros {
  estado?: EstadoCobro;
  clienteId?: string;
}

export async function getPerfil(): Promise<PerfilFiscal> {
  return { ...db().perfil };
}

export async function getClientes(): Promise<Cliente[]> {
  return db().clientes.map((c) => ({ ...c }));
}

export async function getCliente(id: string): Promise<Cliente | undefined> {
  const c = db().clientes.find((x) => x.id === id);
  return c && { ...c };
}

function cobrosConCliente(hoy: string): CobroConCliente[] {
  const s = db(hoy);
  const porId = new Map(s.clientes.map((c) => [c.id, c]));
  return s.cobros.map((c) => ({ ...c, estado: estadoEfectivo(c, hoy), cliente: { ...porId.get(c.clienteId)! } }));
}

/**
 * Cobros con `estado` efectivo (incluye "atrasado") y cliente embebido.
 * Orden: fechaEsperada descendente (más recientes primero).
 */
export async function getCobros(filtro: FiltroCobros = {}): Promise<CobroConCliente[]> {
  return cobrosConCliente(hoyISO())
    .filter((c) => !filtro.estado || c.estado === filtro.estado)
    .filter((c) => !filtro.clienteId || c.clienteId === filtro.clienteId)
    .sort((a, b) => b.fechaEsperada.localeCompare(a.fechaEsperada) || b.id.localeCompare(a.id));
}

export async function getCobro(id: string): Promise<CobroConCliente | undefined> {
  return cobrosConCliente(hoyISO()).find((c) => c.id === id);
}

/** Comprobantes, fecha descendente. */
export async function getComprobantes(): Promise<Comprobante[]> {
  return db()
    .comprobantes.map((c) => ({ ...c }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id));
}

/** Tabla completa de categorías (todas las vigencias). */
export async function getCategorias(): Promise<CategoriaMonotributo[]> {
  return db().categorias.map((c) => ({ ...c }));
}

/** Fila vigente hoy de la categoría del perfil. */
export async function getCategoriaActual(): Promise<CategoriaMonotributo> {
  const hoy = hoyISO();
  const s = db(hoy);
  return { ...categoriaVigente(s.categorias, s.perfil.categoria, hoy) };
}

export async function getConfigFiscal(): Promise<ConfigFiscal> {
  return { ...db().config };
}

export async function getRecordatorioConfig(): Promise<RecordatorioConfig> {
  return { ...RECORDATORIO_CONFIG, diasTrasVencimiento: [...RECORDATORIO_CONFIG.diasTrasVencimiento] };
}

function semaforo(hoy: string): ResultadoSemaforo {
  const s = db(hoy);
  return calcularSemaforo({
    comprobantes: s.comprobantes,
    categoria: s.perfil.categoria,
    tablaCategorias: s.categorias,
    config: s.config,
    hoy,
  });
}

export async function getSemaforo(): Promise<ResultadoSemaforo> {
  return semaforo(hoyISO());
}

/** Simula el impacto de un cobro (en su moneda; USD se convierte con el tipo de cambio de referencia). */
export async function getImpactoDeCobro(monto: number, moneda: Moneda): Promise<ImpactoCobro> {
  const hoy = hoyISO();
  const s = db(hoy);
  return impactoDeCobro({
    montoArs: aArs(monto, moneda, s.config.tipoCambioReferencia),
    comprobantes: s.comprobantes,
    categoria: s.perfil.categoria,
    tablaCategorias: s.categorias,
    config: s.config,
    hoy,
  });
}

function agregar(cobros: CobroConCliente[], tipoCambio: number): MontoAgregado {
  const porMoneda: Record<Moneda, number> = { ARS: 0, USD: 0 };
  let ars = 0;
  for (const c of cobros) {
    porMoneda[c.moneda] += c.monto;
    ars += aArs(c.monto, c.moneda, tipoCambio);
  }
  return { ars, porMoneda, cantidad: cobros.length };
}

/**
 * Métricas del dashboard a hoy. Montos agregados en centavos de ARS convertidos
 * con `tipoCambioReferencia`, más el desglose por moneda original.
 * - cobradoMes: cobrados con fechaCobro en el mes actual.
 * - porCobrar: todos los por_cobrar (no vencidos).
 * - atrasado: todos los atrasados.
 * - reserva: cuota de la categoría + % de reserva sobre cobradoMes.ars.
 * - proximosCobros: por_cobrar y atrasados, por fechaEsperada ascendente, máx 6.
 */
export async function getDashboard(): Promise<Dashboard> {
  const hoy = hoyISO();
  const s = db(hoy);
  const tc = s.config.tipoCambioReferencia;
  const cobros = cobrosConCliente(hoy);
  const mes = mesISO(hoy);
  const cobradoMes = agregar(
    cobros.filter((c) => c.estado === "cobrado" && c.fechaCobro && mesISO(c.fechaCobro) === mes),
    tc,
  );
  const pendientes = cobros
    .filter((c) => c.estado !== "cobrado")
    .sort((a, b) => a.fechaEsperada.localeCompare(b.fechaEsperada) || a.id.localeCompare(b.id));
  return {
    hoy,
    cobradoMes,
    porCobrar: agregar(pendientes.filter((c) => c.estado === "por_cobrar"), tc),
    atrasado: agregar(pendientes.filter((c) => c.estado === "atrasado"), tc),
    reserva: reservaImpuestos({
      cobradoMesArs: cobradoMes.ars,
      categoria: categoriaVigente(s.categorias, s.perfil.categoria, hoy),
      config: s.config,
    }),
    proximosCobros: pendientes.slice(0, MAX_PROXIMOS),
  };
}

export async function getAlertas(): Promise<Alerta[]> {
  const hoy = hoyISO();
  const s = db(hoy);
  return generarAlertas({
    perfil: s.perfil,
    semaforo: semaforo(hoy),
    cobros: s.cobros,
    config: s.config,
    hoy,
    categoria: categoriaVigente(s.categorias, s.perfil.categoria, hoy),
  });
}

/** Recordatorios programados de un cobro (solo lógica; no envía nada). */
export async function getRecordatorios(cobroId: string): Promise<RecordatorioProgramado[]> {
  const hoy = hoyISO();
  const c = db(hoy).cobros.find((x) => x.id === cobroId);
  return c ? programarRecordatorios(c, RECORDATORIO_CONFIG, hoy) : [];
}

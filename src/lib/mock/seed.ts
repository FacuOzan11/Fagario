/**
 * Seed de desarrollo: datos realistas y DETERMINÍSTICOS, generados relativos a `hoy`.
 * Sin Math.random: usa un PRNG con semilla fija. Mismo `hoy` → mismos datos.
 *
 * Calibrado para que la facturación de 12 meses móviles quede en ~82% del tope
 * de la categoría del perfil (semáforo AMARILLO), sea cual sea `hoy`.
 */
import type {
  CategoriaMonotributo,
  Cliente,
  Cobro,
  Comprobante,
  ConfigFiscal,
  LetraCategoria,
  Moneda,
  PerfilFiscal,
} from "@/lib/domain/types";
import { CATEGORIAS_MONOTRIBUTO, categoriaVigente } from "@/lib/config/categorias";
import { CONFIG_FISCAL } from "@/lib/config/fiscal";
import { construirCuit } from "@/lib/fiscal/cuit";
import { aISO, diasEnMes, diferenciaEnDias, minFecha, parseISO, sumarDias, sumarMeses } from "@/lib/fiscal/fechas";
import { aArs } from "@/lib/fiscal/moneda";
import { facturacion12Meses } from "@/lib/fiscal/semaforo";

export const SEED_CATEGORIA: LetraCategoria = "E";
/** Proporción objetivo del tope para la facturación de 12 meses. */
export const SEED_PROPORCION_OBJETIVO = 0.82;

export interface Seed {
  hoy: string;
  perfil: PerfilFiscal;
  clientes: Cliente[];
  cobros: Cobro[];
  comprobantes: Comprobante[];
  categorias: CategoriaMonotributo[];
  config: ConfigFiscal;
}

// --- PRNG determinístico (mulberry32) --------------------------------------
export function crearPrng(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// --- Clientes ----------------------------------------------------------------
const CLIENTES: Cliente[] = [
  { id: "cli-lagos", nombre: "Estudio Lagos Arquitectura", tipo: "local", pais: "AR", cuit: construirCuit("30", 71584392), email: "admin@estudiolagos.com.ar" },
  { id: "cli-malbec", nombre: "Malbec Digital S.R.L.", tipo: "local", pais: "AR", cuit: construirCuit("30", 71692045), email: "pagos@malbecdigital.com.ar" },
  { id: "cli-pampa", nombre: "Pampa Fintech S.A.S.", tipo: "local", pais: "AR", cuit: construirCuit("30", 71773018), email: "proveedores@pampafintech.com.ar" },
  { id: "cli-ruta40", nombre: "Café Ruta 40 S.A.", tipo: "local", pais: "AR", cuit: construirCuit("30", 70948127), email: "administracion@caferuta40.com.ar" },
  { id: "cli-palermo", nombre: "Clínica Dental Palermo S.R.L.", tipo: "local", pais: "AR", cuit: construirCuit("33", 71230564), email: "contacto@dentalpalermo.com.ar" },
  { id: "cli-hollowpine", nombre: "Hollow Pine Software LLC", tipo: "exterior", pais: "US", email: "ap@hollowpine.io" },
  { id: "cli-nubeclara", nombre: "Nube Clara Estudio S.L.", tipo: "exterior", pais: "ES", email: "facturas@nubeclara.es" },
  { id: "cli-feldgrun", nombre: "Feldgrün Mobility GmbH", tipo: "exterior", pais: "DE", email: "rechnungen@feldgruen-mobility.de" },
  { id: "cli-puertosur", nombre: "Puerto Sur Software S.A.", tipo: "exterior", pais: "UY", email: "finanzas@puertosur.com.uy" },
];

const PERFIL_BASE: Omit<PerfilFiscal, "categoria"> = {
  nombre: "Lucía Ferreyra",
  cuit: construirCuit("27", 34871265),
  actividad: "servicios",
  diaVencimientoCuota: 20,
};

// --- Plantillas de cobros ----------------------------------------------------
type Plantilla =
  | {
      kind: "mes";
      /** Mes relativo al de hoy (0 = mes actual). */
      offsetMes: number;
      dia: number;
      clienteId: string;
      concepto: string | ((mesNombre: string) => string);
      /** Monto base en unidades (pesos o dólares) antes de calibrar. */
      base: number;
      moneda: Moneda;
      /** Fuerza por_cobrar aunque la fecha haya pasado (no se usa para mes 0 cobrados). */
      porCobrar?: boolean;
    }
  | {
      kind: "atrasado";
      /** Días antes de hoy. */
      diasAtras: number;
      clienteId: string;
      concepto: string;
      base: number;
      moneda: Moneda;
    };

function plantillas(): Plantilla[] {
  const ps: Plantilla[] = [];
  // Retainer local mensual: 12 meses + próximo
  for (let m = -11; m <= 1; m++) {
    ps.push({
      kind: "mes", offsetMes: m, dia: 1, clienteId: "cli-malbec",
      concepto: (mes) => `Retainer mensual UX — ${mes}`, base: 650_000, moneda: "ARS",
    });
  }
  // Retainer exterior en USD desde hace 8 meses
  for (let m = -8; m <= 1; m++) {
    ps.push({
      kind: "mes", offsetMes: m, dia: 5, clienteId: "cli-hollowpine",
      concepto: (mes) => `Product design retainer — ${mes}`, base: 700, moneda: "USD",
    });
  }
  const p = (offsetMes: number, dia: number, clienteId: string, concepto: string, base: number, moneda: Moneda): Plantilla =>
    ({ kind: "mes", offsetMes, dia, clienteId, concepto, base, moneda });
  ps.push(
    p(-10, 14, "cli-lagos", "Rediseño del sitio institucional", 1_200_000, "ARS"),
    p(-9, 22, "cli-feldgrun", "UX research — entrevistas con usuarios", 1_100, "USD"),
    p(-7, 8, "cli-pampa", "Rediseño de onboarding app — anticipo 50%", 1_200_000, "ARS"),
    p(-6, 18, "cli-nubeclara", "Auditoría de accesibilidad (WCAG 2.2)", 1_500, "USD"),
    p(-5, 12, "cli-pampa", "Rediseño de onboarding app — saldo 50%", 1_200_000, "ARS"),
    p(-4, 25, "cli-palermo", "Diseño de turnero online", 900_000, "ARS"),
    p(-3, 10, "cli-puertosur", "Design system — fase 1", 2_000, "USD"),
    p(-2, 16, "cli-ruta40", "Prototipo app de fidelización", 750_000, "ARS"),
    p(-1, 9, "cli-feldgrun", "Workshop de diseño de servicios", 800, "USD"),
    p(-1, 23, "cli-pampa", "Tests de usabilidad — dashboard", 1_100_000, "ARS"),
    // Mes actual, por cobrar
    p(0, 15, "cli-puertosur", "Design system — fase 2", 1_800, "USD"),
    p(0, 22, "cli-palermo", "Turnero online — iteración 2", 480_000, "ARS"),
    // Próximos meses
    p(1, 12, "cli-nubeclara", "Auditoría de accesibilidad — app móvil", 1_400, "USD"),
    p(2, 6, "cli-pampa", "Rediseño de home banking — anticipo", 1_500_000, "ARS"),
    p(2, 19, "cli-ruta40", "Carta digital y pedidos por QR", 600_000, "ARS"),
  );
  ps.push(
    { kind: "atrasado", diasAtras: 9, clienteId: "cli-ruta40", concepto: "Ajustes de UI — app de fidelización", base: 280_000, moneda: "ARS" },
    { kind: "atrasado", diasAtras: 18, clienteId: "cli-feldgrun", concepto: "Informe de hallazgos — research", base: 650, moneda: "USD" },
    { kind: "atrasado", diasAtras: 37, clienteId: "cli-palermo", concepto: "Landing de campaña — implantes", base: 420_000, moneda: "ARS" },
  );
  return ps;
}

/** Tipo de cambio ARS/USD plausible para una fecha: deriva lineal hasta la referencia en `hoy`. */
export function tipoCambioMock(fecha: string, hoy: string, referencia: number): number {
  const dias = Math.max(0, diferenciaEnDias(fecha, hoy));
  // ~ -20% en un año hacia atrás, con algo de ondulación determinística.
  const deriva = 1 - Math.min(dias, 400) * 0.00055;
  const ondula = 1 + 0.012 * Math.sin(dias / 23);
  return Math.round(referencia * deriva * ondula);
}

function caeFalso(rand: () => number): string {
  let s = "7";
  for (let i = 0; i < 13; i++) s += Math.floor(rand() * 10);
  return s;
}

const redondear = (montoUnidades: number, moneda: Moneda) =>
  moneda === "ARS" ? Math.max(1, Math.round(montoUnidades / 1000)) * 1000 * 100 : Math.max(1, Math.round(montoUnidades / 10)) * 10 * 100;

function construir(hoy: string, factor: number): Omit<Seed, "perfil" | "categorias" | "config"> {
  const rand = crearPrng(20260101);
  const { anio, mes, dia: diaHoy } = parseISO(hoy);
  const cobros: Cobro[] = [];
  const comprobantes: Comprobante[] = [];
  const numeros: Record<"C" | "E", number> = { C: 118, E: 41 };
  let n = 0;

  const items = plantillas().map((pl) => {
    if (pl.kind === "atrasado") {
      return { pl, fechaEsperada: sumarDias(hoy, -pl.diasAtras), concepto: pl.concepto, cobrar: false };
    }
    const ref = sumarMeses(aISO(anio, mes, 1), pl.offsetMes);
    const r = parseISO(ref);
    let d = Math.min(pl.dia, diasEnMes(r.anio, r.mes));
    const esMesActual = pl.offsetMes === 0;
    const concepto = typeof pl.concepto === "string" ? pl.concepto : pl.concepto(MESES[r.mes - 1]);
    // En el mes actual: los retainers ya se cobraron (fecha <= hoy); el resto queda por cobrar (fecha >= hoy).
    const esRetainer = typeof pl.concepto !== "string";
    if (esMesActual && esRetainer) d = Math.min(d, diaHoy);
    if (esMesActual && !esRetainer) d = Math.max(d, diaHoy);
    const fechaEsperada = aISO(r.anio, r.mes, d);
    const cobrar = !pl.porCobrar && (pl.offsetMes < 0 || (esMesActual && esRetainer));
    return { pl, fechaEsperada, concepto, cobrar };
  });

  items.sort((a, b) => a.fechaEsperada.localeCompare(b.fechaEsperada) || a.pl.clienteId.localeCompare(b.pl.clienteId));

  for (const it of items) {
    n++;
    const id = `cob-${String(n).padStart(3, "0")}`;
    const ruido = 1 + (rand() - 0.5) * 0.06; // ±3% para que no sean todos iguales
    const monto = redondear(it.pl.base * factor * ruido, it.pl.moneda);
    const cobro: Cobro = {
      id,
      clienteId: it.pl.clienteId,
      concepto: it.concepto,
      monto,
      moneda: it.pl.moneda,
      fechaEsperada: it.fechaEsperada,
      estado: it.cobrar ? "cobrado" : "por_cobrar",
    };
    const demora = Math.floor(rand() * 6);
    if (it.cobrar) {
      const fechaCobro = minFecha(sumarDias(it.fechaEsperada, demora), hoy);
      cobro.fechaCobro = fechaCobro;
      const cliente = CLIENTES.find((c) => c.id === it.pl.clienteId)!;
      const tipo = cliente.tipo === "local" ? "C" : "E";
      const tipoCambio = it.pl.moneda === "USD" ? tipoCambioMock(fechaCobro, hoy, CONFIG_FISCAL.tipoCambioReferencia) : 1;
      const comp: Comprobante = {
        id: `cmp-${tipo}-${String(numeros[tipo]).padStart(5, "0")}`,
        tipo,
        puntoVenta: 2,
        numero: numeros[tipo]++,
        fecha: fechaCobro,
        clienteId: cliente.id,
        moneda: it.pl.moneda,
        montoOriginal: monto,
        tipoCambio,
        montoArs: aArs(monto, it.pl.moneda, tipoCambio),
        cae: caeFalso(rand),
      };
      comprobantes.push(comp);
      cobro.comprobanteId = comp.id;
    }
    cobros.push(cobro);
  }
  return { hoy, clientes: CLIENTES, cobros, comprobantes };
}

/** Genera el seed completo para `hoy` (ISO). Determinístico. */
export function generarSeed(hoy: string): Seed {
  const categorias = CATEGORIAS_MONOTRIBUTO;
  const tope = categoriaVigente(categorias, SEED_CATEGORIA, hoy).topeAnual;
  // 1ª pasada sin calibrar → factor para llegar al objetivo; 2ª pasada calibrada.
  const crudo = facturacion12Meses(construir(hoy, 1).comprobantes, hoy);
  const factor = crudo > 0 ? (tope * SEED_PROPORCION_OBJETIVO) / crudo : 1;
  const datos = construir(hoy, factor);
  return {
    ...datos,
    perfil: { ...PERFIL_BASE, categoria: SEED_CATEGORIA },
    categorias,
    config: CONFIG_FISCAL,
  };
}

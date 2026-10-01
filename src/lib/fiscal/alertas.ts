import type {
  Alerta,
  CategoriaMonotributo,
  Cobro,
  ConfigFiscal,
  PerfilFiscal,
  ResultadoSemaforo,
  SeveridadAlerta,
} from "@/lib/domain/types";
import { DIA_LIMITE_RECATEGORIZACION_DEFAULT, DIAS_AVISO_VENCIMIENTO_DEFAULT } from "@/lib/config/fiscal";
import { diasDeAtraso, estadoEfectivo } from "./estado";
import { aISO, diasEnMes, diferenciaEnDias, parseISO } from "./fechas";

/** Días de atraso desde los que un cobro atrasado pasa a severidad "danger". */
export const DIAS_ATRASO_CRITICO = 30;

export interface EntradaAlertas {
  perfil: PerfilFiscal;
  semaforo: ResultadoSemaforo;
  cobros: Cobro[];
  config: ConfigFiscal;
  hoy: string;
  /** Fila vigente de la categoría del perfil, para informar el monto de la cuota. */
  categoria?: CategoriaMonotributo;
}

/** Fecha límite de la próxima recategorización relevante, si estamos en el mes o el anterior. */
export function proximaRecategorizacion(
  hoy: string,
  diaLimite: number,
): { mes: 1 | 7; fechaLimite: string; enCurso: boolean } | null {
  const { anio, mes } = parseISO(hoy);
  let objetivo: { anio: number; mes: 1 | 7; enCurso: boolean } | null = null;
  if (mes === 12) objetivo = { anio: anio + 1, mes: 1, enCurso: false };
  else if (mes === 1) objetivo = { anio, mes: 1, enCurso: true };
  else if (mes === 6) objetivo = { anio, mes: 7, enCurso: false };
  else if (mes === 7) objetivo = { anio, mes: 7, enCurso: true };
  if (!objetivo) return null;
  const dia = Math.min(diaLimite, diasEnMes(objetivo.anio, objetivo.mes));
  const fechaLimite = aISO(objetivo.anio, objetivo.mes, dia);
  if (fechaLimite < hoy) return null;
  return { mes: objetivo.mes, fechaLimite, enCurso: objetivo.enCurso };
}

/** Próximo vencimiento de cuota (>= hoy) según el día del perfil (ajustado a fin de mes). */
export function proximoVencimientoCuota(hoy: string, diaVencimiento: number): string {
  const { anio, mes } = parseISO(hoy);
  const en = (a: number, m: number) => aISO(a, m, Math.min(Math.max(1, diaVencimiento), diasEnMes(a, m)));
  const este = en(anio, mes);
  if (este >= hoy) return este;
  return mes === 12 ? en(anio + 1, 1) : en(anio, mes + 1);
}

const PESO: Record<SeveridadAlerta, number> = { danger: 0, warn: 1, info: 2 };

/** Alertas (solo datos, sin copy) ordenadas por severidad y luego por fecha. */
export function generarAlertas({ perfil, semaforo, cobros, config, hoy, categoria }: EntradaAlertas): Alerta[] {
  const alertas: Alerta[] = [];

  // Tope
  if (semaforo.excedido) {
    alertas.push({
      id: "excede-tope",
      tipo: "excede_tope",
      severidad: "danger",
      datos: {
        facturado: semaforo.facturado,
        tope: semaforo.tope,
        excedente: semaforo.facturado - semaforo.tope,
        categoriaCorrespondiente: semaforo.categoriaCorrespondiente,
      },
    });
  } else if (semaforo.nivel !== "verde") {
    alertas.push({
      id: "cerca-del-tope",
      tipo: "cerca_del_tope",
      severidad: semaforo.nivel === "rojo" ? "danger" : "warn",
      datos: { proporcion: semaforo.proporcion, restante: semaforo.restante, tope: semaforo.tope, nivel: semaforo.nivel },
    });
  }

  // Recategorización (enero / julio)
  const recat = proximaRecategorizacion(hoy, config.diaLimiteRecategorizacion ?? DIA_LIMITE_RECATEGORIZACION_DEFAULT);
  if (recat) {
    alertas.push({
      id: `recategorizacion-${recat.fechaLimite.slice(0, 7)}`,
      tipo: "recategorizacion",
      severidad: recat.enCurso ? "warn" : "info",
      fecha: recat.fechaLimite,
      datos: {
        mesRecategorizacion: recat.mes,
        fechaLimite: recat.fechaLimite,
        diasRestantes: diferenciaEnDias(hoy, recat.fechaLimite),
        categoriaActual: perfil.categoria,
        categoriaCorrespondiente: semaforo.categoriaCorrespondiente,
        facturado: semaforo.facturado,
      },
    });
  }

  // Vencimiento de cuota
  const venc = proximoVencimientoCuota(hoy, perfil.diaVencimientoCuota);
  const diasVenc = diferenciaEnDias(hoy, venc);
  if (diasVenc <= (config.diasAvisoVencimientoCuota ?? DIAS_AVISO_VENCIMIENTO_DEFAULT)) {
    alertas.push({
      id: `vencimiento-cuota-${venc}`,
      tipo: "vencimiento_cuota",
      severidad: diasVenc <= 2 ? "warn" : "info",
      fecha: venc,
      datos: { fechaVencimiento: venc, diasRestantes: diasVenc, cuotaMensual: categoria?.cuotaMensual },
    });
  }

  // Cobros atrasados
  for (const c of cobros) {
    if (estadoEfectivo(c, hoy) !== "atrasado") continue;
    const dias = diasDeAtraso(c, hoy);
    alertas.push({
      id: `cobro-atrasado-${c.id}`,
      tipo: "cobro_atrasado",
      severidad: dias > DIAS_ATRASO_CRITICO ? "danger" : "warn",
      fecha: c.fechaEsperada,
      datos: { cobroId: c.id, clienteId: c.clienteId, monto: c.monto, moneda: c.moneda, diasDeAtraso: dias },
    });
  }

  return alertas.sort(
    (a, b) => PESO[a.severidad] - PESO[b.severidad] || (a.fecha ?? "").localeCompare(b.fecha ?? "") || a.id.localeCompare(b.id),
  );
}

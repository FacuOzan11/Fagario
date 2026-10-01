import { describe, expect, it } from "vitest";
import type { Cobro, PerfilFiscal } from "@/lib/domain/types";
import { generarAlertas, proximaRecategorizacion, proximoVencimientoCuota } from "./alertas";
import { calcularSemaforo } from "./semaforo";
import { comp, CONFIG_TEST, TABLA_TEST } from "./test-helpers";

const perfil: PerfilFiscal = { nombre: "X", cuit: "20-12345678-6", categoria: "B", actividad: "servicios", diaVencimientoCuota: 20 };

function alertas(hoy: string, facturado: number, cobros: Cobro[] = [], p = perfil) {
  const semaforo = calcularSemaforo({
    comprobantes: facturado ? [comp(hoy, facturado)] : [],
    categoria: p.categoria,
    tablaCategorias: TABLA_TEST,
    config: CONFIG_TEST,
    hoy,
  });
  return generarAlertas({ perfil: p, semaforo, cobros, config: CONFIG_TEST, hoy, categoria: TABLA_TEST[1] });
}
const tipos = (as: ReturnType<typeof alertas>) => as.map((a) => a.tipo);

describe("proximaRecategorizacion", () => {
  it("avisa en diciembre (enero próximo) y en enero hasta el día límite", () => {
    expect(proximaRecategorizacion("2026-12-05", 20)).toEqual({ mes: 1, fechaLimite: "2027-01-20", enCurso: false });
    expect(proximaRecategorizacion("2027-01-20", 20)).toEqual({ mes: 1, fechaLimite: "2027-01-20", enCurso: true });
    expect(proximaRecategorizacion("2027-01-21", 20)).toBeNull();
  });
  it("junio/julio", () => {
    expect(proximaRecategorizacion("2026-06-30", 20)?.fechaLimite).toBe("2026-07-20");
    expect(proximaRecategorizacion("2026-07-01", 20)?.enCurso).toBe(true);
  });
  it("otros meses: nada", () => {
    for (const m of ["02", "03", "04", "05", "08", "09", "10", "11"]) {
      expect(proximaRecategorizacion(`2026-${m}-10`, 20)).toBeNull();
    }
  });
});

describe("proximoVencimientoCuota", () => {
  it("este mes si no pasó, si no el siguiente", () => {
    expect(proximoVencimientoCuota("2026-10-01", 20)).toBe("2026-10-20");
    expect(proximoVencimientoCuota("2026-10-20", 20)).toBe("2026-10-20");
    expect(proximoVencimientoCuota("2026-10-21", 20)).toBe("2026-11-20");
    expect(proximoVencimientoCuota("2026-12-21", 20)).toBe("2027-01-20");
  });
  it("ajusta a fin de mes (febrero bisiesto)", () => {
    expect(proximoVencimientoCuota("2028-02-10", 31)).toBe("2028-02-29");
    expect(proximoVencimientoCuota("2026-02-10", 31)).toBe("2026-02-28");
  });
});

describe("generarAlertas", () => {
  it("verde, fuera de recategorización y lejos del vencimiento: nada", () => {
    expect(alertas("2026-10-01", 100)).toEqual([]);
  });
  it("vencimiento a 7 días avisa (info); a 8 no; a 2 es warn", () => {
    expect(tipos(alertas("2026-10-13", 0))).toEqual(["vencimiento_cuota"]);
    expect(alertas("2026-10-12", 0)).toEqual([]);
    const a = alertas("2026-10-18", 0)[0];
    expect(a.severidad).toBe("warn");
    expect(a.tipo === "vencimiento_cuota" && a.datos.diasRestantes).toBe(2);
    expect(a.tipo === "vencimiento_cuota" && a.datos.cuotaMensual).toBe(20_000);
  });
  it("cerca del tope: amarillo warn, rojo danger", () => {
    expect(alertas("2026-10-01", 1_500_000)[0]).toMatchObject({ tipo: "cerca_del_tope", severidad: "warn" });
    expect(alertas("2026-10-01", 1_800_000)[0]).toMatchObject({ tipo: "cerca_del_tope", severidad: "danger" });
  });
  it("excede tope reemplaza a cerca del tope", () => {
    const as = alertas("2026-10-01", 2_500_000);
    expect(tipos(as)).toEqual(["excede_tope"]);
    expect(as[0].tipo === "excede_tope" && as[0].datos).toMatchObject({ excedente: 500_000, categoriaCorrespondiente: "C" });
  });
  it("recategorización en enero con fecha límite", () => {
    const as = alertas("2027-01-05", 0);
    const r = as.find((a) => a.tipo === "recategorizacion");
    expect(r).toMatchObject({ severidad: "warn", fecha: "2027-01-20", id: "recategorizacion-2027-01" });
    expect(r?.tipo === "recategorizacion" && r.datos.diasRestantes).toBe(15);
  });
  it("cobros atrasados: warn, danger tras 30 días; ignora cobrados y futuros", () => {
    const base = { clienteId: "c", concepto: "x", monto: 1, moneda: "ARS" as const };
    const cobros: Cobro[] = [
      { ...base, id: "a", fechaEsperada: "2026-09-30", estado: "por_cobrar" },
      { ...base, id: "b", fechaEsperada: "2026-08-01", estado: "por_cobrar" },
      { ...base, id: "c", fechaEsperada: "2026-08-01", estado: "cobrado", fechaCobro: "2026-08-02" },
      { ...base, id: "d", fechaEsperada: "2026-10-01", estado: "por_cobrar" },
    ];
    const as = alertas("2026-10-01", 0, cobros);
    expect(as.map((a) => [a.id, a.severidad])).toEqual([
      ["cobro-atrasado-b", "danger"],
      ["cobro-atrasado-a", "warn"],
    ]);
  });
  it("ordena por severidad", () => {
    const as = alertas("2026-10-18", 1_800_000);
    expect(as.map((a) => a.severidad)).toEqual(["danger", "warn"]);
  });
});

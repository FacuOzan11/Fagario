import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getAlertas, getCobros, getDashboard, getImpactoDeCobro, getRecordatorios, getSemaforo } from "./index";

describe("data layer (seed, hoy fijo)", () => {
  beforeAll(() => {
    process.env.TOPE_HOY = "2026-10-01";
  });
  afterAll(() => {
    delete process.env.TOPE_HOY;
  });

  it("getCobros devuelve estado efectivo, cliente embebido y filtra", async () => {
    const todos = await getCobros();
    expect(todos.length).toBeGreaterThan(35);
    expect(todos.every((c) => c.cliente.id === c.clienteId)).toBe(true);
    const atrasados = await getCobros({ estado: "atrasado" });
    expect(atrasados.length).toBe(3);
    expect(atrasados.every((c) => c.estado === "atrasado")).toBe(true);
  });

  it("dashboard coherente", async () => {
    const d = await getDashboard();
    expect(d.hoy).toBe("2026-10-01");
    expect(d.cobradoMes.cantidad).toBeGreaterThan(0);
    expect(d.cobradoMes.ars).toBeGreaterThan(0);
    expect(d.porCobrar.cantidad).toBeGreaterThan(0);
    expect(d.atrasado.cantidad).toBe(3);
    expect(d.reserva.total).toBe(d.reserva.cuotaMensual + d.reserva.reservaAdicional);
    expect(d.proximosCobros.length).toBeLessThanOrEqual(6);
    const fechas = d.proximosCobros.map((c) => c.fechaEsperada);
    expect([...fechas].sort()).toEqual(fechas);
    expect(d.proximosCobros.every((c) => c.estado !== "cobrado")).toBe(true);
  });

  it("semáforo amarillo y alertas", async () => {
    const s = await getSemaforo();
    expect(s.nivel).toBe("amarillo");
    const a = await getAlertas();
    expect(a.some((x) => x.tipo === "cerca_del_tope")).toBe(true);
    expect(a.filter((x) => x.tipo === "cobro_atrasado")).toHaveLength(3);
  });

  it("simulación y recordatorios", async () => {
    const s = await getSemaforo();
    const r = await getImpactoDeCobro(s.restante + 100, "ARS");
    expect(r.superaTope).toBe(true);
    expect(r.categoriaResultante).toBe("F");
    const [atrasado] = await getCobros({ estado: "atrasado" });
    const rec = await getRecordatorios(atrasado.id);
    expect(rec.length).toBe(3);
    expect(rec.some((x) => x.estado === "enviado_simulado")).toBe(true);
  });
});

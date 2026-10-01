import { describe, expect, it } from "vitest";
import type { Cobro } from "@/lib/domain/types";
import { conEstadoEfectivo, diasDeAtraso, estadoEfectivo } from "./estado";

const base: Cobro = {
  id: "x",
  clienteId: "c",
  concepto: "c",
  monto: 100,
  moneda: "ARS",
  fechaEsperada: "2026-09-30",
  estado: "por_cobrar",
};

describe("estadoEfectivo", () => {
  it("por_cobrar vencido ayer → atrasado", () => {
    expect(estadoEfectivo(base, "2026-10-01")).toBe("atrasado");
    expect(diasDeAtraso(base, "2026-10-01")).toBe(1);
  });
  it("vence hoy → por_cobrar", () => {
    expect(estadoEfectivo(base, "2026-09-30")).toBe("por_cobrar");
    expect(diasDeAtraso(base, "2026-09-30")).toBe(0);
  });
  it("cobrado nunca está atrasado", () => {
    const c = { ...base, estado: "cobrado" as const, fechaCobro: "2026-09-30" };
    expect(estadoEfectivo(c, "2027-01-01")).toBe("cobrado");
    expect(diasDeAtraso(c, "2027-01-01")).toBe(0);
  });
  it("atrasado persistido pero con fecha futura → por_cobrar", () => {
    expect(estadoEfectivo({ ...base, estado: "atrasado" }, "2026-09-01")).toBe("por_cobrar");
  });
  it("cuenta días cruzando 29 de febrero", () => {
    expect(diasDeAtraso({ ...base, fechaEsperada: "2028-02-28" }, "2028-03-01")).toBe(2);
  });
  it("conEstadoEfectivo no muta", () => {
    const r = conEstadoEfectivo(base, "2026-10-05");
    expect(r.estado).toBe("atrasado");
    expect(base.estado).toBe("por_cobrar");
  });
});

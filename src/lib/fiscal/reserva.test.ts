import { describe, expect, it } from "vitest";
import { reservaImpuestos } from "./reserva";

describe("reservaImpuestos", () => {
  it("cuota + porcentaje del cobrado", () => {
    expect(
      reservaImpuestos({ cobradoMesArs: 1_000_000_00, categoria: { cuotaMensual: 105_000_00 }, config: { porcentajeReserva: 0.05 } }),
    ).toEqual({
      cobradoMesArs: 1_000_000_00,
      cuotaMensual: 105_000_00,
      porcentajeReserva: 0.05,
      reservaAdicional: 50_000_00,
      total: 155_000_00,
    });
  });
  it("sin cobros: solo la cuota", () => {
    const r = reservaImpuestos({ cobradoMesArs: 0, categoria: { cuotaMensual: 42_000_00 }, config: { porcentajeReserva: 0.05 } });
    expect(r.total).toBe(42_000_00);
    expect(r.reservaAdicional).toBe(0);
  });
  it("redondea al centavo y no admite negativos", () => {
    expect(reservaImpuestos({ cobradoMesArs: 333, categoria: { cuotaMensual: 0 }, config: { porcentajeReserva: 0.05 } }).reservaAdicional).toBe(17);
    expect(reservaImpuestos({ cobradoMesArs: -500, categoria: { cuotaMensual: 1 }, config: { porcentajeReserva: 0.05 } }).total).toBe(1);
  });
});

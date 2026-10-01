import { describe, expect, it } from "vitest";
import {
  NBSP,
  diasEntre,
  formatFecha,
  formatFechaRelativa,
  formatMes,
  formatMoney,
  formatNumero,
  formatPorcentaje,
} from "./format";

describe("formatMoney", () => {
  it("pesos sin decimales con miles con punto", () => {
    expect(formatMoney(123456700, "ARS")).toBe(`$${NBSP}1.234.567`);
  });
  it("dólares con prefijo US$", () => {
    expect(formatMoney(123400, "USD")).toBe(`US$${NBSP}1.234`);
  });
  it("redondea al entero por defecto", () => {
    expect(formatMoney(123450, "ARS")).toBe(`$${NBSP}1.235`);
    expect(formatMoney(99, "ARS")).toBe(`$${NBSP}1`);
  });
  it("muestra centavos con coma si se pide", () => {
    expect(formatMoney(123450, "ARS", { decimals: 2 })).toBe(`$${NBSP}1.234,50`);
    expect(formatMoney(5, "USD", { decimals: 2 })).toBe(`US$${NBSP}0,05`);
  });
  it("cero y montos chicos", () => {
    expect(formatMoney(0, "ARS")).toBe(`$${NBSP}0`);
    expect(formatMoney(50000, "ARS")).toBe(`$${NBSP}500`);
  });
  it("negativos con signo adelante", () => {
    expect(formatMoney(-123400, "ARS")).toBe(`-$${NBSP}1.234`);
    expect(formatMoney(-10, "ARS")).toBe(`$${NBSP}0`);
  });
});

describe("formatNumero", () => {
  it("agrupa miles", () => {
    expect(formatNumero(1000000)).toBe("1.000.000");
    expect(formatNumero(999)).toBe("999");
    expect(formatNumero(1234.5, 1)).toBe("1.234,5");
  });
});

describe("formatPorcentaje", () => {
  it("pegado al número, sin decimales", () => {
    expect(formatPorcentaje(0.82)).toBe("82%");
    expect(formatPorcentaje(1)).toBe("100%");
    expect(formatPorcentaje(1.07)).toBe("107%");
    expect(formatPorcentaje(0)).toBe("0%");
  });
  it("con decimales usa coma", () => {
    expect(formatPorcentaje(0.825, { decimals: 1 })).toBe("82,5%");
  });
});

describe("formatFecha", () => {
  it("mismo año: sin año", () => {
    expect(formatFecha("2026-10-15", "2026-10-01")).toBe("15 de octubre");
    expect(formatFecha("2026-01-01", "2026-10-01")).toBe("1 de enero");
  });
  it("otro año: con año", () => {
    expect(formatFecha("2025-12-31", "2026-01-02")).toBe("31 de diciembre de 2025");
    expect(formatFecha("2027-03-05", "2026-10-01")).toBe("5 de marzo de 2027");
  });
  it("no se corre de día por zona horaria", () => {
    expect(formatFecha("2026-03-01", "2026-01-01")).toBe("1 de marzo");
  });
  it("rechaza fechas inválidas", () => {
    expect(() => formatFecha("15/10/2026", "2026-10-01")).toThrow();
  });
});

describe("formatFechaRelativa", () => {
  const hoy = "2026-10-01";
  it("hoy / mañana / ayer", () => {
    expect(formatFechaRelativa("2026-10-01", hoy)).toBe("hoy");
    expect(formatFechaRelativa("2026-10-02", hoy)).toBe("mañana");
    expect(formatFechaRelativa("2026-09-30", hoy)).toBe("ayer");
  });
  it("futuro y pasado en días", () => {
    expect(formatFechaRelativa("2026-10-04", hoy)).toBe("en 3 días");
    expect(formatFechaRelativa("2026-09-29", hoy)).toBe("hace 2 días");
  });
  it("cruza meses y años", () => {
    expect(formatFechaRelativa("2027-01-01", "2026-12-31")).toBe("mañana");
    expect(diasEntre("2026-02-27", "2026-03-02")).toBe(3);
  });
});

describe("formatMes", () => {
  it("largo y corto", () => {
    expect(formatMes("2026-03")).toBe("marzo");
    expect(formatMes("2026-03", "corto")).toBe("mar");
    expect(formatMes("2026-12-15", "corto")).toBe("dic");
  });
  it("rechaza meses inválidos", () => {
    expect(() => formatMes("2026-13")).toThrow();
  });
});

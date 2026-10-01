import { describe, expect, it } from "vitest";
import { aArs } from "./moneda";

describe("aArs", () => {
  it("ARS queda igual e ignora tipo de cambio", () => {
    expect(aArs(150_000, "ARS", 1450)).toBe(150_000);
    expect(aArs(150_000, "ARS", 0)).toBe(150_000);
  });
  it("USD multiplica por el tipo de cambio", () => {
    expect(aArs(100_00, "USD", 1450)).toBe(145_000_00);
    expect(aArs(1, "USD", 1450.5)).toBe(1451); // 1450.5 → redondeo
  });
  it("tipo de cambio inválido lanza", () => {
    expect(() => aArs(100, "USD", 0)).toThrow();
    expect(() => aArs(100, "USD", Number.NaN)).toThrow();
    expect(() => aArs(100, "USD", -1)).toThrow();
  });
});

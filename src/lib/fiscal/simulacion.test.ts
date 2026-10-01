import { describe, expect, it } from "vitest";
import { impactoDeCobro } from "./simulacion";
import { comp, CONFIG_TEST, TABLA_TEST } from "./test-helpers";

const HOY = "2026-10-01";
const ctx = (montos: number[], categoria: "A" | "B" | "C" | "K" = "B") => ({
  comprobantes: montos.map((m) => comp("2026-05-10", m)),
  categoria,
  tablaCategorias: TABLA_TEST,
  config: CONFIG_TEST,
  hoy: HOY,
});

describe("impactoDeCobro", () => {
  it("cobro chico: sin cambios", () => {
    const r = impactoDeCobro({ ...ctx([1_000_000]), montoArs: 10_000 });
    expect(r.cambiaNivel).toBe(false);
    expect(r.superaTope).toBe(false);
    expect(r.categoriaResultante).toBeUndefined();
    expect(r.restanteDespues).toBe(990_000);
  });
  it("cambia de verde a amarillo justo en el umbral", () => {
    const r = impactoDeCobro({ ...ctx([1_400_000]), montoArs: 100_000 });
    expect(r.antes.nivel).toBe("verde");
    expect(r.despues.nivel).toBe("amarillo");
    expect(r.cambiaNivel).toBe(true);
    expect(r.superaTope).toBe(false);
  });
  it("llegar exacto al tope no lo supera", () => {
    const r = impactoDeCobro({ ...ctx([1_900_000]), montoArs: 100_000 });
    expect(r.superaTope).toBe(false);
    expect(r.restanteDespues).toBe(0);
  });
  it("te pasa de categoría: devuelve la categoría a la que pasaría", () => {
    const r = impactoDeCobro({ ...ctx([1_900_000]), montoArs: 100_001 });
    expect(r.superaTope).toBe(true);
    expect(r.categoriaResultante).toBe("C");
    expect(r.excedeCategoriaMaxima).toBe(false);
  });
  it("salta varias categorías", () => {
    const r = impactoDeCobro({ ...ctx([500_000], "A"), montoArs: 3_000_000 });
    expect(r.categoriaResultante).toBe("K");
  });
  it("ya excedido antes: superaTope false, pero informa categoría", () => {
    const r = impactoDeCobro({ ...ctx([2_500_000]), montoArs: 1 });
    expect(r.antes.excedido).toBe(true);
    expect(r.superaTope).toBe(false);
    expect(r.categoriaResultante).toBe("C");
  });
  it("excede la categoría máxima", () => {
    const r = impactoDeCobro({ ...ctx([9_000_000], "K"), montoArs: 2_000_000 });
    expect(r.superaTope).toBe(true);
    expect(r.excedeCategoriaMaxima).toBe(true);
    expect(r.categoriaResultante).toBeUndefined();
  });
  it("sin comprobantes", () => {
    const r = impactoDeCobro({ ...ctx([]), montoArs: 0 });
    expect(r.antes.facturado).toBe(0);
    expect(r.despues.nivel).toBe("verde");
  });
});

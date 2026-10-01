import { describe, expect, it } from "vitest";
import type { CategoriaMonotributo } from "@/lib/domain/types";
import { CATEGORIAS_MONOTRIBUTO, categoriaVigente, tablaVigente } from "./categorias";

describe("tabla de categorías", () => {
  it("tiene A–K, placeholder y topes/cuotas crecientes", () => {
    expect(CATEGORIAS_MONOTRIBUTO.map((c) => c.letra).join("")).toBe("ABCDEFGHIJK");
    for (let i = 1; i < CATEGORIAS_MONOTRIBUTO.length; i++) {
      expect(CATEGORIAS_MONOTRIBUTO[i].topeAnual).toBeGreaterThan(CATEGORIAS_MONOTRIBUTO[i - 1].topeAnual);
      expect(CATEGORIAS_MONOTRIBUTO[i].cuotaMensual).toBeGreaterThan(CATEGORIAS_MONOTRIBUTO[i - 1].cuotaMensual);
    }
    expect(CATEGORIAS_MONOTRIBUTO.every((c) => c.placeholder)).toBe(true);
    expect(CATEGORIAS_MONOTRIBUTO.every((c) => Number.isInteger(c.topeAnual))).toBe(true);
  });
});

describe("categoriaVigente", () => {
  const tabla: CategoriaMonotributo[] = [
    { letra: "A", topeAnual: 100, cuotaMensual: 1, vigenciaDesde: "2025-08-01", placeholder: true },
    { letra: "A", topeAnual: 200, cuotaMensual: 2, vigenciaDesde: "2026-02-01", placeholder: true },
    { letra: "A", topeAnual: 300, cuotaMensual: 3, vigenciaDesde: "2026-08-01", placeholder: true },
    { letra: "B", topeAnual: 500, cuotaMensual: 5, vigenciaDesde: "2026-02-01", placeholder: true },
  ];
  it("elige la fila más reciente ya vigente", () => {
    expect(categoriaVigente(tabla, "A", "2026-05-10").topeAnual).toBe(200);
    expect(categoriaVigente(tabla, "A", "2026-08-01").topeAnual).toBe(300);
    expect(categoriaVigente(tabla, "A", "2026-01-31").topeAnual).toBe(100);
  });
  it("lanza si no hay fila vigente", () => {
    expect(() => categoriaVigente(tabla, "A", "2025-07-31")).toThrow();
    expect(() => categoriaVigente(tabla, "C", "2026-05-10")).toThrow();
  });
  it("tablaVigente ordena y omite letras sin vigencia", () => {
    expect(tablaVigente(tabla, "2026-03-01").map((c) => [c.letra, c.topeAnual])).toEqual([
      ["A", 200],
      ["B", 500],
    ]);
  });
});

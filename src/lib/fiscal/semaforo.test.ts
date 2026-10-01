import { describe, expect, it } from "vitest";
import { aArs } from "./moneda";
import { calcularSemaforo, categoriaParaFacturacion, facturacion12Meses, nivelPorProporcion } from "./semaforo";
import { comp, CONFIG_TEST, TABLA_TEST } from "./test-helpers";

const HOY = "2026-10-01";
const sem = (comprobantes: ReturnType<typeof comp>[], categoria: "A" | "B" | "C" | "K" = "B", hoy = HOY) =>
  calcularSemaforo({ comprobantes, categoria, tablaCategorias: TABLA_TEST, config: CONFIG_TEST, hoy });

describe("facturacion12Meses", () => {
  it("sin comprobantes → 0", () => {
    expect(facturacion12Meses([], HOY)).toBe(0);
  });
  it("incluye hoy y el primer día de la ventana; excluye hace exactamente 12 meses y el futuro", () => {
    const cs = [
      comp("2026-10-01", 1), // hoy
      comp("2025-10-02", 10), // primer día de la ventana
      comp("2025-10-01", 100), // hace exactamente 12 meses → afuera
      comp("2026-10-02", 1000), // futuro → afuera
    ];
    expect(facturacion12Meses(cs, HOY)).toBe(11);
  });
  it("bisiesto: hoy 29/02 → ventana desde 01/03 del año anterior", () => {
    const cs = [comp("2027-02-28", 1), comp("2027-03-01", 10), comp("2028-02-29", 100)];
    expect(facturacion12Meses(cs, "2028-02-29")).toBe(110);
  });
  it("suma montoArs (USD ya convertido) e ignora montoOriginal", () => {
    const usd = comp("2026-05-01", aArs(1000_00, "USD", 1200), {
      moneda: "USD",
      montoOriginal: 1000_00,
      tipoCambio: 1200,
    });
    expect(facturacion12Meses([usd], HOY)).toBe(1_200_000_00);
  });
});

describe("nivelPorProporcion", () => {
  it("justo en el umbral pasa al nivel superior", () => {
    expect(nivelPorProporcion(0.7499, CONFIG_TEST)).toBe("verde");
    expect(nivelPorProporcion(0.75, CONFIG_TEST)).toBe("amarillo");
    expect(nivelPorProporcion(0.8999, CONFIG_TEST)).toBe("amarillo");
    expect(nivelPorProporcion(0.9, CONFIG_TEST)).toBe("rojo");
    expect(nivelPorProporcion(1.5, CONFIG_TEST)).toBe("rojo");
  });
});

describe("calcularSemaforo", () => {
  it("sin comprobantes: verde, todo restante, serie en cero", () => {
    const s = sem([]);
    expect(s).toMatchObject({ facturado: 0, tope: 2_000_000, restante: 2_000_000, proporcion: 0, nivel: "verde", excedido: false });
    expect(s.categoriaSiguiente).toBe("C");
    expect(s.categoriaCorrespondiente).toBe("A");
    expect(s.serieMensual).toHaveLength(12);
    expect(s.serieMensual.every((p) => p.montoArs === 0)).toBe(true);
    expect(s.serieMensual[0].mes).toBe("2025-11");
    expect(s.serieMensual[11].mes).toBe("2026-10");
  });
  it("justo en umbral amarillo (75%)", () => {
    const s = sem([comp("2026-06-01", 1_500_000)]);
    expect(s.proporcion).toBe(0.75);
    expect(s.nivel).toBe("amarillo");
  });
  it("justo en umbral rojo (90%)", () => {
    expect(sem([comp("2026-06-01", 1_800_000)]).nivel).toBe("rojo");
  });
  it("justo en el tope: rojo pero no excedido", () => {
    const s = sem([comp("2026-06-01", 2_000_000)]);
    expect(s.excedido).toBe(false);
    expect(s.restante).toBe(0);
    expect(s.categoriaCorrespondiente).toBe("B");
  });
  it("supera el tope: excedido, restante 0, categoría correspondiente superior", () => {
    const s = sem([comp("2026-06-01", 2_000_001)]);
    expect(s.excedido).toBe(true);
    expect(s.restante).toBe(0);
    expect(s.proporcion).toBeGreaterThan(1);
    expect(s.categoriaCorrespondiente).toBe("C");
  });
  it("supera la categoría máxima", () => {
    const s = sem([comp("2026-06-01", 20_000_000)], "K");
    expect(s.categoriaSiguiente).toBeUndefined();
    expect(s.categoriaCorrespondiente).toBeUndefined();
    expect(s.excedido).toBe(true);
  });
  it("serie mensual agrupa por mes calendario", () => {
    const s = sem([comp("2026-10-01", 5), comp("2026-09-30", 7), comp("2026-09-01", 3), comp("2025-10-15", 99)]);
    const porMes = Object.fromEntries(s.serieMensual.map((p) => [p.mes, p.montoArs]));
    expect(porMes["2026-10"]).toBe(5);
    expect(porMes["2026-09"]).toBe(10);
    expect(porMes["2025-10"]).toBeUndefined();
  });
  it("ventana expuesta", () => {
    expect(sem([]).ventana).toEqual({ desde: "2025-10-02", hasta: HOY });
  });
});

describe("categoriaParaFacturacion", () => {
  it("elige la más baja que cubre", () => {
    expect(categoriaParaFacturacion(0, TABLA_TEST, HOY)).toBe("A");
    expect(categoriaParaFacturacion(1_000_000, TABLA_TEST, HOY)).toBe("A");
    expect(categoriaParaFacturacion(1_000_001, TABLA_TEST, HOY)).toBe("B");
    expect(categoriaParaFacturacion(3_000_001, TABLA_TEST, HOY)).toBe("K");
  });
});

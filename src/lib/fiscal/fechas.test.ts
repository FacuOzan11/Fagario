import { describe, expect, it } from "vitest";
import {
  diasEnMes,
  diferenciaEnDias,
  esBisiesto,
  esFechaISO,
  finDeMes,
  inicioDeMes,
  mesISO,
  parseISO,
  sumarDias,
  sumarMeses,
  ultimosMeses,
  ventana12Meses,
} from "./fechas";

describe("fechas", () => {
  it("parsea y valida", () => {
    expect(parseISO("2026-10-01")).toEqual({ anio: 2026, mes: 10, dia: 1 });
    expect(esFechaISO("2026-02-29")).toBe(false);
    expect(esFechaISO("2024-02-29")).toBe(true);
    expect(esFechaISO("2026-13-01")).toBe(false);
    expect(esFechaISO("2026-1-01")).toBe(false);
  });

  it("bisiestos", () => {
    expect(esBisiesto(2024)).toBe(true);
    expect(esBisiesto(2026)).toBe(false);
    expect(esBisiesto(1900)).toBe(false);
    expect(esBisiesto(2000)).toBe(true);
    expect(diasEnMes(2028, 2)).toBe(29);
    expect(diasEnMes(2026, 2)).toBe(28);
  });

  it("sumarDias cruza meses, años y 29 de febrero", () => {
    expect(sumarDias("2026-10-01", -1)).toBe("2026-09-30");
    expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(sumarDias("2028-02-28", 1)).toBe("2028-02-29");
    expect(sumarDias("2028-02-29", 1)).toBe("2028-03-01");
    expect(sumarDias("2026-02-28", 1)).toBe("2026-03-01");
    expect(sumarDias("2026-03-29", 0)).toBe("2026-03-29");
  });

  it("sumarMeses ajusta al último día", () => {
    expect(sumarMeses("2024-01-31", 1)).toBe("2024-02-29");
    expect(sumarMeses("2026-01-31", 1)).toBe("2026-02-28");
    expect(sumarMeses("2024-02-29", -12)).toBe("2023-02-28");
    expect(sumarMeses("2024-02-29", 48)).toBe("2028-02-29");
    expect(sumarMeses("2026-10-01", -12)).toBe("2025-10-01");
    expect(sumarMeses("2026-01-15", -1)).toBe("2025-12-15");
    expect(sumarMeses("2026-12-15", 1)).toBe("2027-01-15");
    expect(sumarMeses("2026-03-31", -25)).toBe("2024-02-29");
  });

  it("inicio/fin de mes", () => {
    expect(inicioDeMes("2026-10-17")).toBe("2026-10-01");
    expect(finDeMes("2028-02-03")).toBe("2028-02-29");
    expect(finDeMes("2026-09-03")).toBe("2026-09-30");
    expect(mesISO("2026-09-03")).toBe("2026-09");
  });

  it("diferenciaEnDias", () => {
    expect(diferenciaEnDias("2026-09-30", "2026-10-01")).toBe(1);
    expect(diferenciaEnDias("2026-10-01", "2026-09-01")).toBe(-30);
    expect(diferenciaEnDias("2028-02-01", "2028-03-01")).toBe(29);
    expect(diferenciaEnDias("2026-01-01", "2027-01-01")).toBe(365);
    expect(diferenciaEnDias("2028-01-01", "2029-01-01")).toBe(366);
  });

  it("ventana de 12 meses móviles", () => {
    expect(ventana12Meses("2026-10-01")).toEqual({ desde: "2025-10-02", hasta: "2026-10-01" });
    expect(ventana12Meses("2028-02-29")).toEqual({ desde: "2027-03-01", hasta: "2028-02-29" });
    expect(ventana12Meses("2026-03-31")).toEqual({ desde: "2025-04-01", hasta: "2026-03-31" });
  });

  it("ultimosMeses", () => {
    expect(ultimosMeses("2026-02-15", 3)).toEqual(["2025-12", "2026-01", "2026-02"]);
    expect(ultimosMeses("2026-10-01", 12)).toHaveLength(12);
    expect(ultimosMeses("2026-10-01", 12)[0]).toBe("2025-11");
  });
});

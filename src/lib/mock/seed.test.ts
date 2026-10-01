import { describe, expect, it } from "vitest";
import { validarCuit } from "@/lib/fiscal/cuit";
import { estadoEfectivo } from "@/lib/fiscal/estado";
import { calcularSemaforo } from "@/lib/fiscal/semaforo";
import { generarSeed } from "./seed";

const HOYS = ["2026-10-01", "2026-10-31", "2027-01-15", "2028-02-29", "2026-03-31"];

describe("seed", () => {
  it("es determinístico", () => {
    expect(generarSeed("2026-10-01")).toEqual(generarSeed("2026-10-01"));
  });

  for (const hoy of HOYS) {
    describe(`hoy=${hoy}`, () => {
      const s = generarSeed(hoy);
      const sem = calcularSemaforo({
        comprobantes: s.comprobantes,
        categoria: s.perfil.categoria,
        tablaCategorias: s.categorias,
        config: s.config,
        hoy,
      });

      it("semáforo amarillo ~82%", () => {
        expect(sem.nivel).toBe("amarillo");
        expect(sem.proporcion).toBeGreaterThan(0.8);
        expect(sem.proporcion).toBeLessThan(0.84);
      });

      it("CUITs válidos y 9 clientes (5 locales / 4 exterior)", () => {
        expect(validarCuit(s.perfil.cuit)).toBe(true);
        expect(s.clientes).toHaveLength(9);
        expect(s.clientes.filter((c) => c.tipo === "local")).toHaveLength(5);
        for (const c of s.clientes.filter((c) => c.tipo === "local")) expect(validarCuit(c.cuit!)).toBe(true);
      });

      it("~40 cobros con mezcla de estados, 2–3 atrasados", () => {
        expect(s.cobros.length).toBeGreaterThanOrEqual(38);
        const ef = s.cobros.map((c) => estadoEfectivo(c, hoy));
        expect(ef.filter((e) => e === "atrasado").length).toBeGreaterThanOrEqual(2);
        expect(ef.filter((e) => e === "atrasado").length).toBeLessThanOrEqual(3);
        expect(ef.filter((e) => e === "cobrado").length).toBeGreaterThan(s.cobros.length / 2);
        expect(ef.filter((e) => e === "por_cobrar").length).toBeGreaterThanOrEqual(3);
        expect(new Set(s.cobros.map((c) => c.moneda))).toEqual(new Set(["ARS", "USD"]));
      });

      it("hay cobros cobrados y por cobrar en el mes actual", () => {
        const mes = hoy.slice(0, 7);
        const delMes = s.cobros.filter((c) => (c.fechaCobro ?? c.fechaEsperada).startsWith(mes));
        expect(delMes.some((c) => c.estado === "cobrado")).toBe(true);
        expect(delMes.some((c) => estadoEfectivo(c, hoy) === "por_cobrar")).toBe(true);
      });

      it("cada cobrado tiene comprobante coherente (C local / E exterior, CAE 14 dígitos)", () => {
        for (const c of s.cobros) {
          if (c.estado !== "cobrado") {
            expect(c.comprobanteId).toBeUndefined();
            continue;
          }
          expect(c.fechaCobro! <= hoy).toBe(true);
          const comp = s.comprobantes.find((x) => x.id === c.comprobanteId)!;
          const cli = s.clientes.find((x) => x.id === c.clienteId)!;
          expect(comp.tipo).toBe(cli.tipo === "local" ? "C" : "E");
          expect(comp.cae).toMatch(/^\d{14}$/);
          expect(comp.montoOriginal).toBe(c.monto);
          if (c.moneda === "USD") expect(comp.tipoCambio).toBeGreaterThan(900);
          else expect(comp.montoArs).toBe(c.monto);
        }
        expect(s.comprobantes.every((x) => Number.isInteger(x.montoArs))).toBe(true);
      });
    });
  }
});

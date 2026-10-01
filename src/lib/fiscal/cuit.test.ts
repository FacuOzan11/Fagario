import { describe, expect, it } from "vitest";
import { construirCuit, digitoVerificadorCuit, formatearCuit, validarCuit } from "./cuit";

describe("validarCuit", () => {
  it("acepta CUITs válidos con y sin guiones", () => {
    // 20-12345678-6: suma = 5*2+4*0+3*1+2*2+7*3+6*4+5*5+4*6+3*7+2*8 = 148; 148%11=5; 11-5=6
    expect(validarCuit("20-12345678-6")).toBe(true);
    expect(validarCuit("20123456786")).toBe(true);
    expect(validarCuit("30-71234567-1")).toBe(digitoVerificadorCuit("3071234567") === 1);
  });
  it("rechaza dígito incorrecto, largo o prefijo inválido", () => {
    expect(validarCuit("20-12345678-5")).toBe(false);
    expect(validarCuit("20-1234567-6")).toBe(false);
    expect(validarCuit("99-12345678-6")).toBe(false);
    expect(validarCuit("abc")).toBe(false);
    expect(validarCuit("")).toBe(false);
  });
  it("dígito 11 → 0", () => {
    // Buscar un cuerpo con resto 0
    let encontrado = false;
    for (let n = 10000000; n < 10000100; n++) {
      const cuerpo = `20${n}`;
      if (digitoVerificadorCuit(cuerpo) === 0) {
        expect(validarCuit(`${cuerpo}0`)).toBe(true);
        encontrado = true;
        break;
      }
    }
    expect(encontrado).toBe(true);
  });
  it("construirCuit siempre devuelve uno válido y formateado", () => {
    for (let n = 30_000_000; n < 30_000_050; n++) {
      const c = construirCuit("27", n);
      expect(c).toMatch(/^27-\d{8}-\d$/);
      expect(validarCuit(c)).toBe(true);
    }
    expect(formatearCuit("20123456786")).toBe("20-12345678-6");
  });
});

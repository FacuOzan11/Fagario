import { afterEach, describe, expect, it } from "vitest";
import { hoyISO } from "./hoy";

describe("hoyISO", () => {
  afterEach(() => {
    delete process.env.TOPE_HOY;
  });
  it("usa la fecha de Buenos Aires (UTC-3)", () => {
    expect(hoyISO(new Date("2026-10-01T02:59:00Z"))).toBe("2026-09-30");
    expect(hoyISO(new Date("2026-10-01T03:00:00Z"))).toBe("2026-10-01");
  });
  it("respeta TOPE_HOY", () => {
    process.env.TOPE_HOY = "2027-01-05";
    expect(hoyISO(new Date("2026-10-01T12:00:00Z"))).toBe("2027-01-05");
  });
});

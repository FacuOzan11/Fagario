import { describe, expect, it } from "vitest";
import { programarRecordatorios } from "./recordatorios";

const cfg = { activo: true, diasTrasVencimiento: [3, 7, 15] };
const cobro = { id: "k1", estado: "por_cobrar" as const, fechaEsperada: "2026-09-20" };

describe("programarRecordatorios", () => {
  it("programa fechaEsperada + días con estados según hoy", () => {
    const r = programarRecordatorios(cobro, cfg, "2026-09-27");
    expect(r.map((x) => [x.fecha, x.estado])).toEqual([
      ["2026-09-23", "enviado_simulado"],
      ["2026-09-27", "enviado_simulado"], // justo hoy
      ["2026-10-05", "pendiente"],
    ]);
    expect(r[0].id).toBe("k1-r3");
  });
  it("cobro cobrado → todos omitidos", () => {
    const r = programarRecordatorios({ ...cobro, estado: "cobrado" }, cfg, "2026-09-27");
    expect(r.every((x) => x.estado === "omitido")).toBe(true);
  });
  it("config inactiva → omitidos", () => {
    expect(programarRecordatorios(cobro, { ...cfg, activo: false }, "2026-09-01").every((x) => x.estado === "omitido")).toBe(true);
  });
  it("cruza 29 de febrero", () => {
    const r = programarRecordatorios({ ...cobro, fechaEsperada: "2028-02-26" }, cfg, "2028-01-01");
    expect(r[0].fecha).toBe("2028-02-29");
    expect(r[0].estado).toBe("pendiente");
  });
  it("ordena y deduplica días; sin días → vacío", () => {
    expect(programarRecordatorios(cobro, { activo: true, diasTrasVencimiento: [7, 3, 7] }, "2026-01-01").map((x) => x.diasTrasVencimiento)).toEqual([3, 7]);
    expect(programarRecordatorios(cobro, { activo: true, diasTrasVencimiento: [] }, "2026-01-01")).toEqual([]);
  });
});

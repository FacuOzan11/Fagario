import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const RUTAS = [
  "/dashboard",
  "/semaforo",
  "/cobros",
  "/cobros?estado=atrasado",
  "/cobros?estado=cobrado",
  "/clientes",
  "/design",
] as const;

const ESQUEMAS = ["light", "dark"] as const;

for (const ruta of RUTAS) {
  for (const esquema of ESQUEMAS) {
    test(`a11y ${ruta} · ${esquema}`, async ({ page }) => {
      // reducedMotion: las animaciones de entrada (opacidad) no deben alterar el cálculo de contraste.
      await page.emulateMedia({ colorScheme: esquema, reducedMotion: "reduce" });
      await page.goto(ruta);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("h1").first()).toBeVisible();

      // El tema "del sistema" sigue al esquema emulado.
      const oscuro = await page.evaluate(() => {
        const bg = getComputedStyle(document.body).backgroundColor;
        const [r, g, b] = bg.match(/\d+/g)!.map(Number);
        return (r + g + b) / 3 < 128;
      });
      expect(oscuro).toBe(esquema === "dark");

      const res = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const resumen = res.violations.map(
        (v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => `${n.target.join(" ")} → ${n.failureSummary?.split("\n").slice(1).join(" ")}`).join("\n  ")}`,
      );
      expect(resumen, resumen.join("\n")).toEqual([]);

      const overflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(overflow.scroll, "sin scroll horizontal").toBeLessThanOrEqual(overflow.client);
    });
  }
}

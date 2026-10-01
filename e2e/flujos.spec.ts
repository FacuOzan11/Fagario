import { expect, test, type Locator, type Page } from "@playwright/test";

/** Valores esperados del seed para TOPE_HOY=2026-10-01 (ver playwright.config.ts). */
const SEED = {
  cobradoMes: "$ 1.379.000",
  porCobrar: "$ 7.170.000",
  atrasado: "$ 1.358.000",
  apartar: "$ 173.950",
  conteos: { todos: 41, por_cobrar: 7, atrasado: 3, cobrado: 31 },
};

/** Normaliza espacios (formatMoney usa NBSP entre símbolo y número). */
const norm = (s: string | null) => (s ?? "").replace(/\s+/g, " ").trim();

async function focoVisible(loc: Locator) {
  return loc.evaluate((el) => {
    const cs = getComputedStyle(el);
    const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
    const shadow = cs.boxShadow !== "none" && cs.boxShadow !== "";
    return outline || shadow;
  });
}

const esMobile = (page: Page) => (page.viewportSize()?.width ?? 0) < 768;
const navPrincipal = (page: Page) =>
  esMobile(page) ? page.locator("nav[aria-label]").last() : page.locator("aside nav");

test.describe("teclado", () => {
  test("el skip link es el primer Tab y lleva al main", async ({ page }) => {
    await page.goto("/dashboard");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    expect(await focoVisible(skip)).toBe(true);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#contenido$/);
    await expect(page.locator("main#contenido")).toBeFocused();
  });

  test("Tab recorre la navegación con foco visible", async ({ page }) => {
    await page.goto("/dashboard");
    const links = navPrincipal(page).getByRole("link");
    const total = await links.count();
    expect(total).toBeGreaterThanOrEqual(5);
    const visitados = new Set<string>();
    // Recorre todo el orden de Tab de la página (mobile: la bottom nav queda al final).
    for (let i = 0; i < 80 && visitados.size < total; i++) {
      await page.keyboard.press("Tab");
      const activo = page.locator(":focus");
      const href = await activo.getAttribute("href").catch(() => null);
      const enNav = await activo.evaluate(
        (el, sel) => !!el.closest(sel),
        esMobile(page) ? "body > nav, nav.fixed" : "aside nav",
      );
      if (enNav && href) {
        expect(await focoVisible(activo), `foco visible en ${href}`).toBe(true);
        visitados.add(href);
      }
    }
    expect(visitados.size).toBe(total);
  });

  test("todos los interactivos tienen foco visible (dashboard)", async ({ page }) => {
    await page.goto("/dashboard");
    const sinFoco: string[] = [];
    let prev = "";
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press("Tab");
      const f = page.locator(":focus");
      if ((await f.count()) === 0) break;
      const id = await f.evaluate((el) => el.outerHTML.slice(0, 120));
      if (id === prev) break;
      prev = id;
      if (!(await focoVisible(f))) sinFoco.push(id);
    }
    expect(sinFoco).toEqual([]);
  });
});

test.describe("navegación", () => {
  test("/ redirige a /dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("el ítem activo tiene aria-current=page", async ({ page }) => {
    for (const [ruta, label] of [
      ["/dashboard", "Inicio"],
      ["/cobros", "Cobros"],
      ["/semaforo", "Semáforo"],
    ] as const) {
      await page.goto(ruta);
      const nav = navPrincipal(page);
      const activos = nav.locator('[aria-current="page"]');
      await expect(activos).toHaveCount(1);
      await expect(activos).toContainText(label);
    }
  });

  test("navegar con el nav cambia de pantalla", async ({ page }) => {
    await page.goto("/dashboard");
    await navPrincipal(page).getByRole("link", { name: /Cobros/ }).click();
    await expect(page).toHaveURL(/\/cobros$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cobros");
  });

  test("404 en ruta inexistente", async ({ page }) => {
    const res = await page.goto("/no-existe-esta-ruta");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Esta página no existe");
    await page.getByRole("link", { name: "Volver al inicio" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

test.describe("cobros", () => {
  const filtros = (page: Page) => page.getByRole("navigation", { name: /filtr/i });

  test("los filtros cambian la lista y el conteo", async ({ page }) => {
    await page.goto("/cobros");
    const conteo = page.locator("h1 + p");
    await expect(conteo).toHaveText(`${SEED.conteos.todos} cobros`);
    await expect(page.locator("main section ul > li")).toHaveCount(SEED.conteos.todos);

    for (const [estado, n] of [
      ["por_cobrar", SEED.conteos.por_cobrar],
      ["atrasado", SEED.conteos.atrasado],
      ["cobrado", SEED.conteos.cobrado],
    ] as const) {
      const link = filtros(page).locator(`a[href="/cobros?estado=${estado}"]`);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`estado=${estado}`));
      await expect(link).toHaveAttribute("aria-current", "page");
      await expect(conteo).toHaveText(`${n} cobro${n === 1 ? "" : "s"}`);
      await expect(page.locator("main section ul > li")).toHaveCount(n);
      await expect(link).toContainText(String(n));
    }
  });

  test("el filtro atrasado solo muestra atrasados", async ({ page }) => {
    await page.goto("/cobros?estado=atrasado");
    const filas = page.locator("main section ul > li");
    await expect(filas).toHaveCount(SEED.conteos.atrasado);
    for (const fila of await filas.all()) await expect(fila).toContainText(/atrasad|venci/i);
  });

  test("estado inválido cae en 'todos'", async ({ page }) => {
    await page.goto("/cobros?estado=cualquiera");
    await expect(page.locator("h1 + p")).toHaveText(`${SEED.conteos.todos} cobros`);
  });

  test("empty state cuando un filtro queda vacío", async ({ page }) => {
    // Con el seed fijo ningún filtro queda vacío: forzamos uno con un clienteId inexistente
    // no es posible por URL, así que verificamos que cada filtro con 0 mostraría el EmptyState.
    await page.goto("/cobros");
    const vacios = await filtros(page)
      .getByRole("link")
      .evaluateAll((ls) => ls.filter((l) => /\b0\b/.test(l.textContent ?? "")).map((l) => l.getAttribute("href")!));
    test.skip(vacios.length === 0, "Ningún filtro queda vacío con el seed de TOPE_HOY=2026-10-01");
    for (const href of vacios) {
      await page.goto(href);
      await expect(page.locator("main h2").first()).toBeVisible();
      await expect(page.locator("main section ul > li")).toHaveCount(0);
    }
  });
});

test.describe("semáforo", () => {
  test("simulador: 8.000.000 ARS cambia de categoría; 100.000 sigue en amarillo", async ({ page }) => {
    await page.goto("/semaforo");
    const input = page.getByLabel("Monto del cobro");
    const resultado = page.locator('[aria-live="polite"]').filter({ has: page.locator("p") }).last();

    await input.fill("8000000");
    await expect(resultado).toContainText("Este cobro te pasa a la categoría", { timeout: 10_000 });

    await input.fill("100000");
    await expect(resultado).toContainText("Seguís en amarillo", { timeout: 10_000 });

    // Cambiar a USD reinterpreta el monto: US$ 100.000 supera holgadamente el tope.
    await page.getByRole("radio", { name: "USD" }).check({ force: true });
    await expect(resultado).toContainText("Te pasaste", { timeout: 10_000 });
    await input.fill("100");
    await expect(resultado).toContainText("Seguís en amarillo", { timeout: 10_000 });

    await input.fill("");
    await expect(resultado).not.toContainText("Seguís");
  });

  test("muestra nivel amarillo y 82%", async ({ page }) => {
    await page.goto("/semaforo");
    await expect(page.getByText("Semáforo en amarillo").first()).toBeVisible();
    await expect(page.getByText(/82\s*%/).first()).toBeVisible();
  });
});

test.describe("dashboard", () => {
  test("las 4 métricas coinciden con el seed y el semáforo está en amarillo/82%", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Buen día");
    const cards = page.locator('[data-slot="metric-card"]');
    await expect(cards).toHaveCount(4);
    const esperados = [SEED.cobradoMes, SEED.porCobrar, SEED.atrasado, SEED.apartar];
    for (let i = 0; i < 4; i++) {
      const money = cards.nth(i).locator('[data-slot="money"] > .sr-only').first();
      await expect.poll(async () => norm(await money.textContent())).toBe(esperados[i]);
    }
    // El valor animado termina mostrando el mismo número.
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.reload();
    const visible = cards.nth(1).locator('[data-slot="money"] > [aria-hidden]').first();
    // En tamaños grandes el símbolo va en su propio span: se compara sin espacios.
    const sinEspacios = (t: string | null) => (t ?? "").replace(/\s+/g, "");
    await expect
      .poll(async () => sinEspacios(await visible.textContent()), { timeout: 5_000 })
      .toBe(sinEspacios(SEED.porCobrar));

    const semaforo = page.locator("section").filter({ has: page.locator("#semaforo-titulo") });
    await expect(semaforo.getByRole("meter", { name: "Semáforo en amarillo" })).toBeVisible();
    await expect(semaforo).toContainText(/82\s*% del tope/);
    await expect(semaforo).toContainText("Te faltan $ 5.322.650 para el tope");
  });
});

test.describe("tema", () => {
  test("el toggle cambia la clase de <html> y persiste tras reload", async ({ page }) => {
    await page.goto("/dashboard");
    const toggle = page.locator('[data-slot="theme-toggle"]:visible');
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/\b(dark|light)\b/);

    await toggle.click(); // system -> light
    await expect(html).toHaveClass(/\blight\b/);
    await toggle.click(); // light -> dark
    await expect(html).toHaveClass(/\bdark\b/);
    await expect(toggle).toHaveAttribute("aria-label", /Tema oscuro/);

    await page.reload();
    await expect(html).toHaveClass(/\bdark\b/);
    await expect(page.locator('[data-slot="theme-toggle"]:visible')).toHaveAttribute("aria-label", /Tema oscuro/);
    const bgOscuro = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    await page.locator('[data-slot="theme-toggle"]:visible').click(); // dark -> system
    await expect(html).not.toHaveClass(/\b(dark|light)\b/);
    await page.reload();
    await expect(html).not.toHaveClass(/\b(dark|light)\b/);
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe(bgOscuro);
  });
});

test.describe("hidratación", () => {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    for (const tema of ["system", "dark"] as const) {
      test(`sin errores de consola ni de hidratación · motion=${reducedMotion} · tema=${tema}`, async ({ page }) => {
        const errores: string[] = [];
        page.on("console", (m) => {
          if (m.type() === "error") errores.push(m.text());
        });
        page.on("pageerror", (e) => errores.push(e.message));
        await page.emulateMedia({ reducedMotion });
        if (tema === "dark") await page.addInitScript(() => localStorage.setItem("tope-theme", "dark"));
        for (const ruta of ["/dashboard", "/semaforo", "/cobros", "/clientes", "/design"]) {
          await page.goto(ruta);
          await page.waitForLoadState("networkidle");
        }
        expect(errores).toEqual([]);
      });
    }
  }
});

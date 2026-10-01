import { defineConfig, devices } from "@playwright/test";

/**
 * E2E + accesibilidad. Fecha fija (TOPE_HOY/TOPE_HORA) para que el seed y el saludo sean determinísticos.
 * Chromium preinstalado en /opt/pw-browsers (no correr `playwright install`).
 */
const PORT = 3200;
const CHROMIUM = process.env.PW_CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const launchOptions = { executablePath: CHROMIUM };

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        launchOptions,
      },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/dashboard`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: { TOPE_HOY: "2026-10-01", TOPE_HORA: "10", NEXT_TELEMETRY_DISABLED: "1" },
  },
});

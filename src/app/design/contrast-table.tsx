"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";

type Pair = { fg: string; bg: string; min: number; uso: string };

const PAIRS: Pair[] = [
  { fg: "foreground", bg: "background", min: 4.5, uso: "Texto principal" },
  { fg: "foreground", bg: "surface", min: 4.5, uso: "Texto en cards" },
  { fg: "foreground", bg: "surface-muted", min: 4.5, uso: "Texto sobre fondo apagado" },
  { fg: "muted-foreground", bg: "background", min: 4.5, uso: "Texto secundario" },
  { fg: "muted-foreground", bg: "surface", min: 4.5, uso: "Secundario en cards" },
  { fg: "muted-foreground", bg: "surface-muted", min: 4.5, uso: "Badge neutral" },
  { fg: "subtle-foreground", bg: "background", min: 4.5, uso: "Metadatos" },
  { fg: "subtle-foreground", bg: "surface", min: 4.5, uso: "Placeholder" },
  { fg: "subtle-foreground", bg: "surface-muted", min: 4.5, uso: "Contadores y badges sobre fondo apagado" },
  { fg: "accent-foreground", bg: "accent", min: 4.5, uso: "Botón primario" },
  { fg: "accent-foreground", bg: "accent-hover", min: 4.5, uso: "Botón primario (hover)" },
  { fg: "accent", bg: "background", min: 4.5, uso: "Enlaces y acento" },
  { fg: "accent", bg: "accent-soft", min: 4.5, uso: "Badge acento" },
  { fg: "ok-foreground", bg: "ok-soft", min: 4.5, uso: "Badge en regla" },
  { fg: "warn-foreground", bg: "warn-soft", min: 4.5, uso: "Badge atención" },
  { fg: "danger-foreground", bg: "danger-soft", min: 4.5, uso: "Badge riesgo" },
  { fg: "danger", bg: "surface", min: 4.5, uso: "Mensaje de error" },
  { fg: "danger", bg: "background", min: 4.5, uso: "Danger ghost" },
  { fg: "border-strong", bg: "surface", min: 3, uso: "Borde de input" },
  { fg: "border-strong", bg: "background", min: 3, uso: "Botón secundario, ticks" },
  { fg: "ring", bg: "background", min: 3, uso: "Anillo de foco" },
  { fg: "ok", bg: "surface-muted", min: 3, uso: "Barra en regla" },
  { fg: "warn", bg: "surface-muted", min: 3, uso: "Barra atención" },
  { fg: "danger", bg: "surface-muted", min: 3, uso: "Barra riesgo" },
];

const TOKENS = Array.from(new Set(PAIRS.flatMap((p) => [p.fg, p.bg])));

function luminance(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.replace(/./g, "$&$&") : h;
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => {
    mo.disconnect();
    mq.removeEventListener("change", cb);
  };
}

function getSnapshot() {
  const cs = getComputedStyle(document.documentElement);
  return TOKENS.map((t) => cs.getPropertyValue(`--${t}`).trim()).join("|");
}

export function ContrastTable() {
  const snapshot = React.useSyncExternalStore(subscribe, getSnapshot, () => "");
  const values = React.useMemo(() => {
    const list = snapshot ? snapshot.split("|") : [];
    return Object.fromEntries(TOKENS.map((t, i) => [t, list[i] ?? ""]));
  }, [snapshot]);

  return (
    <div
      role="region"
      aria-label="Tabla de contraste"
      tabIndex={0}
      className="overflow-x-auto rounded-lg border border-border focus-visible:ring-2 focus-visible:ring-ring"
    >
      <table className="w-full min-w-[560px] text-left text-sm">
        <caption className="sr-only">Ratios de contraste del tema activo</caption>
        <thead className="text-eyebrow text-muted-foreground">
          <tr className="border-b border-border">
            <th scope="col" className="px-5 py-3.5 font-medium">Par</th>
            <th scope="col" className="px-5 py-3.5 font-medium">Uso</th>
            <th scope="col" className="px-5 py-3.5 text-right font-medium">Ratio</th>
            <th scope="col" className="px-5 py-3.5 text-right font-medium">AA</th>
          </tr>
        </thead>
        <tbody>
          {PAIRS.map((p) => {
            const fg = values[p.fg];
            const bg = values[p.bg];
            const r = fg && bg ? ratio(fg, bg) : null;
            const pass = r !== null && r >= p.min;
            return (
              <tr key={`${p.fg}/${p.bg}`} className="border-b border-border last:border-0">
                <td className="px-5 py-3">
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm border border-border font-serif text-base"
                      style={{ background: `var(--${p.bg})`, color: `var(--${p.fg})` }}
                    >
                      {/* Pares no textuales (≥ 3:1: bordes, barras, foco): un trazo, no texto. */}
                      {p.min < 4.5 ? (
                        <span className="h-1 w-4 rounded-full" style={{ background: `var(--${p.fg})` }} />
                      ) : (
                        "Aa"
                      )}
                    </span>
                    <code className="font-mono text-xs text-foreground">
                      {p.fg}
                      <span className="text-subtle-foreground"> / </span>
                      {p.bg}
                    </code>
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{p.uso}</td>
                <td className="px-5 py-3 text-right font-medium tabular-nums">
                  {r === null ? "—" : `${r.toFixed(2)}:1`}
                </td>
                <td className="px-5 py-3 text-right">
                  {r === null ? (
                    <span className="text-subtle-foreground">—</span>
                  ) : (
                    <Badge variant={pass ? "ok" : "danger"} dot>
                      {pass ? "Pasa" : "No pasa"} ≥ {p.min}
                    </Badge>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

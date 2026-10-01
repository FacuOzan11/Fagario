"use client";

import * as React from "react";
import { Desktop, Moon, Sun } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { THEME_STORAGE_KEY } from "./theme-script";

type Theme = "light" | "dark" | "system";

const ORDER: Theme[] = ["light", "dark", "system"];
const LABEL: Record<Theme, string> = { light: "claro", dark: "oscuro", system: "del sistema" };

const listeners = new Set<() => void>();

function read(): Theme {
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function write(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* almacenamiento no disponible: el tema vale solo para esta vista */
  }
  const c = document.documentElement.classList;
  c.remove("dark", "light");
  if (theme !== "system") c.add(theme);
  current = theme;
  listeners.forEach((l) => l());
}

let current: Theme | null = null;

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
const getSnapshot = () => (current ??= read());
const getServerSnapshot = (): Theme => "system";

function ThemeToggle({ className }: { className?: string }) {
  const theme = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Desktop;

  return (
    <Button
      variant="ghost"
      size="icon"
      data-slot="theme-toggle"
      className={cn("text-muted-foreground hover:text-foreground", className)}
      aria-label={`Tema ${LABEL[theme]}. Cambiar a tema ${LABEL[next]}`}
      title={`Tema ${LABEL[theme]}`}
      onClick={() => write(next)}
    >
      <Icon weight="light" aria-hidden />
    </Button>
  );
}

export { ThemeToggle };
export type { Theme };

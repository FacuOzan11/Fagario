import type * as React from "react";
import Link from "next/link";
import { Gear } from "@phosphor-icons/react/dist/ssr";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { copy } from "@/content/copy";
import type { PerfilFiscal } from "@/lib/domain/types";
import { BottomNav } from "./bottom-nav";
import { Logo } from "./logo";
import { MotionProvider } from "./motion-provider";
import { SidebarNav } from "./sidebar-nav";

export const MAIN_ID = "contenido";

function SkipLink() {
  return (
    <a
      href={`#${MAIN_ID}`}
      className="bg-accent text-accent-foreground sr-only z-50 rounded-md px-4 py-2.5 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {copy.app.skipLink}
    </a>
  );
}

export function AppShell({
  perfil,
  children,
}: {
  perfil: PerfilFiscal;
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
      <SkipLink />
      <div className="min-h-dvh md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="border-border hidden border-r md:block">
          <aside className="sticky top-0 flex h-dvh flex-col px-4 pt-7 pb-5">
            <div className="px-3 pb-10">
              <Logo />
            </div>
            <SidebarNav />
            <div className="border-border mt-auto flex items-center gap-3 border-t pt-5 pl-2">
              <Avatar name={perfil.nombre} className="size-9 text-base" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{perfil.nombre}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {copy.semaforo.categoria(perfil.categoria)}
                </p>
              </div>
              <ThemeToggle className="-mr-1" />
            </div>
          </aside>
        </div>

        <div className="flex min-w-0 flex-col">
          <header className="border-border bg-background sticky top-0 z-30 flex h-14 items-center justify-between border-b pr-2 pl-5 md:hidden">
            <Logo className="text-[1.625rem]" />
            <div className="flex items-center">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <Link href="/ajustes" aria-label={copy.nav.items.ajustes}>
                  <Gear weight="light" aria-hidden />
                </Link>
              </Button>
              <ThemeToggle />
            </div>
          </header>
          <main
            id={MAIN_ID}
            tabIndex={-1}
            className="flex-1 pb-[calc(6rem+env(safe-area-inset-bottom))] outline-none md:pb-0"
          >
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
    </MotionProvider>
  );
}

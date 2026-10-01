import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "@phosphor-icons/react/dist/ssr";

import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { copy } from "@/content/copy";

const e = copy.errores.noEncontrado;

export const metadata: Metadata = { title: e.titulo };

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 py-8 sm:px-8">
      <header>
        <Logo />
      </header>
      <main id="contenido" className="flex flex-1 items-center py-16">
        <EmptyState
          icon={Compass}
          headingLevel="h1"
          title={e.titulo}
          description={e.descripcion}
          className="animate-rise w-full border-none"
          action={
            <Button asChild>
              <Link href="/dashboard">{e.cta}</Link>
            </Button>
          }
        />
      </main>
    </div>
  );
}

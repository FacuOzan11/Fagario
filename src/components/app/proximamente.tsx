import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { copy } from "@/content/copy";
import { PageContainer, Reveal } from "./page";

/** Página "Próximamente" para secciones de fases futuras. */
export function Proximamente({
  titulo,
  descripcion,
  icon,
}: {
  titulo: string;
  descripcion: string;
  icon: Icon;
}) {
  return (
    <PageContainer className="grid gap-10">
      <Reveal as="header" className="grid gap-3">
        <p className="text-eyebrow text-accent">{copy.proximamente.etiqueta}</p>
        <h1 className="text-display">{titulo}</h1>
      </Reveal>
      <Reveal index={1}>
        <EmptyState
          icon={icon}
          headingLevel="h2"
          title={copy.proximamente.etiqueta}
          description={descripcion}
          className="py-20"
          action={
            <Button asChild variant="secondary">
              <Link href="/dashboard">{copy.proximamente.volver}</Link>
            </Button>
          }
        />
      </Reveal>
    </PageContainer>
  );
}

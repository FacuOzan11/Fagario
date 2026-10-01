"use client";

import { useEffect } from "react";
import { CloudWarning } from "@phosphor-icons/react";

import { PageContainer } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { copy } from "@/content/copy";

export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const e = copy.errores.generico;
  return (
    <PageContainer>
      <EmptyState
        icon={CloudWarning}
        headingLevel="h1"
        title={e.titulo}
        description={e.descripcion}
        className="py-24"
        action={<Button onClick={() => retry()}>{e.cta}</Button>}
      />
    </PageContainer>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, HandCoins, Receipt, Wallet } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

import { CobroRow } from "@/components/app/cobro-row";
import { FiltroCobrosNav, FILTROS } from "@/components/app/filtro-cobros";
import { NuevoCobroButton } from "@/components/app/nuevo-cobro-button";
import { PageContainer, Reveal } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { copy, type FiltroCobros } from "@/content/copy";
import { formatMes } from "@/content/format";
import { getCobros, getConfigFiscal, hoyISO } from "@/lib/data";
import type { CobroConCliente } from "@/lib/domain/types";

export const metadata: Metadata = { title: copy.cobros.titulo };

const ICONO_VACIO: Record<FiltroCobros, Icon> = {
  todos: Receipt,
  por_cobrar: HandCoins,
  cobrado: Wallet,
  atrasado: CheckCircle,
};

function parseFiltro(v: string | string[] | undefined): FiltroCobros {
  const s = Array.isArray(v) ? v[0] : v;
  return FILTROS.includes(s as FiltroCobros) ? (s as FiltroCobros) : "todos";
}

/** Agrupa por mes de la fecha esperada, respetando el orden recibido. */
function porMes(cobros: CobroConCliente[]) {
  const grupos = new Map<string, CobroConCliente[]>();
  for (const c of cobros) {
    const k = c.fechaEsperada.slice(0, 7);
    grupos.set(k, [...(grupos.get(k) ?? []), c]);
  }
  return [...grupos.entries()];
}

export default async function CobrosPage({ searchParams }: PageProps<"/cobros">) {
  const filtro = parseFiltro((await searchParams).estado);
  const hoy = hoyISO();
  const [todos, config] = await Promise.all([getCobros(), getConfigFiscal()]);
  const lista = filtro === "todos" ? todos : await getCobros({ estado: filtro });
  const conteos = Object.fromEntries(
    FILTROS.map((f) => [f, f === "todos" ? todos.length : todos.filter((c) => c.estado === f).length]),
  ) as Record<FiltroCobros, number>;
  const anioHoy = hoy.slice(0, 4);
  const vacio = copy.emptyStates.cobros[filtro];

  return (
    <PageContainer className="grid gap-10 md:gap-12">
      <Reveal as="header" className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
        <div className="grid gap-2">
          <h1 className="text-display">{copy.cobros.titulo}</h1>
          <p className="text-muted-foreground tabular-nums">{copy.cobros.conteo(lista.length)}</p>
        </div>
        <NuevoCobroButton className="w-full sm:w-auto" />
      </Reveal>

      <Reveal index={1} className="min-w-0">
        <FiltroCobrosNav activo={filtro} conteos={conteos} />
      </Reveal>

      <Reveal index={2} className="grid gap-12">
        {lista.length === 0 ? (
          <EmptyState
            icon={ICONO_VACIO[filtro]}
            title={vacio.titulo}
            description={vacio.descripcion}
            headingLevel="h2"
            className="py-20"
            action={
              filtro === "cobrado" ? (
                <Button asChild variant="secondary">
                  <Link href="/cobros?estado=por_cobrar">{vacio.cta}</Link>
                </Button>
              ) : filtro === "atrasado" ? (
                <Button asChild variant="secondary">
                  <Link href="/cobros">{vacio.cta}</Link>
                </Button>
              ) : (
                <NuevoCobroButton>{vacio.cta}</NuevoCobroButton>
              )
            }
          />
        ) : (
          porMes(lista).map(([mes, cobros]) => {
            const titulo = `${formatMes(mes)}${mes.slice(0, 4) !== anioHoy ? ` ${mes.slice(0, 4)}` : ""}`;
            return (
              <section key={mes} aria-labelledby={`mes-${mes}`} className="grid gap-2">
                <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                  <h2 id={`mes-${mes}`} className="text-eyebrow text-muted-foreground">
                    {titulo}
                  </h2>
                  <span className="text-xs text-subtle-foreground tabular-nums">{copy.cobros.conteo(cobros.length)}</span>
                </div>
                <ul className="divide-y divide-border">
                  {cobros.map((c) => (
                    <CobroRow key={c.id} cobro={c} hoy={hoy} tipoCambio={config.tipoCambioReferencia} acciones />
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </Reveal>
    </PageContainer>
  );
}

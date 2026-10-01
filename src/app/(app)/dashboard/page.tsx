import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { AyudaPopover } from "@/components/app/ayuda-popover";
import { CobroRow } from "@/components/app/cobro-row";
import { MetricCard } from "@/components/app/metric-card";
import { PageContainer, Reveal, SectionHeader } from "@/components/app/page";
import { desgloseMonedas } from "@/components/app/presenters";
import { SemaforoResumen } from "@/components/app/semaforo-resumen";
import { Button } from "@/components/ui/button";
import { copy } from "@/content/copy";
import { formatFecha, formatMes, formatMoney, formatPorcentaje } from "@/content/format";
import { getConfigFiscal, getDashboard, getPerfil, getSemaforo, horaAR } from "@/lib/data";

export const metadata: Metadata = { title: copy.nav.items.inicio };

export default async function DashboardPage() {
  const [perfil, d, semaforo, config] = await Promise.all([
    getPerfil(),
    getDashboard(),
    getSemaforo(),
    getConfigFiscal(),
  ]);
  const m = copy.dashboard.metricas;
  const tc = config.tipoCambioReferencia;
  const hayUsd = d.cobradoMes.porMoneda.USD + d.porCobrar.porMoneda.USD + d.atrasado.porMoneda.USD > 0;

  return (
    <PageContainer className="grid gap-12 md:gap-16">
      <Reveal as="header" className="grid gap-3">
        <p className="text-eyebrow text-accent">
          {copy.dashboard.titulo} · {formatFecha(d.hoy, d.hoy)}
        </p>
        <h1 className="text-display max-w-4xl text-balance">{copy.dashboard.saludo(perfil.nombre, horaAR())}</h1>
        <p className="text-lg text-muted-foreground">{copy.dashboard.subtitulo(formatMes(d.hoy))}</p>
      </Reveal>

      <Reveal index={1} as="section" aria-labelledby="metricas-titulo" className="grid gap-4">
        <h2 id="metricas-titulo" className="sr-only">
          {copy.dashboard.titulo}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label={m.cobrado.label}
            cents={d.cobradoMes.ars}
            breakdown={desgloseMonedas(d.cobradoMes.porMoneda)}
            description={m.cobrado.descripcion}
          />
          <MetricCard
            label={m.porCobrar.label}
            cents={d.porCobrar.ars}
            breakdown={desgloseMonedas(d.porCobrar.porMoneda)}
            description={m.porCobrar.descripcion}
          />
          <MetricCard
            label={m.atrasado.label}
            cents={d.atrasado.ars}
            tone={d.atrasado.ars > 0 ? "danger" : "default"}
            breakdown={desgloseMonedas(d.atrasado.porMoneda)}
            description={d.atrasado.ars > 0 ? m.atrasado.descripcion : m.atrasado.descripcionVacia}
          />
          <MetricCard
            label={m.apartar.label}
            cents={d.reserva.total}
            description={m.apartar.descripcion}
            help={
              <AyudaPopover title={m.apartar.ayudaTitulo}>
                <p className="text-muted-foreground">{m.apartar.ayuda}</p>
                <div className="grid gap-1.5 border-t border-border pt-3 tabular-nums">
                  <p>{m.apartar.detalleCuota(formatMoney(d.reserva.cuotaMensual, "ARS"))}</p>
                  <p>
                    {m.apartar.detalleReserva(
                      formatMoney(d.reserva.reservaAdicional, "ARS"),
                      formatPorcentaje(d.reserva.porcentajeReserva),
                    )}
                  </p>
                </div>
              </AyudaPopover>
            }
          />
        </div>
        {hayUsd ? (
          <p className="text-xs text-subtle-foreground">
            {copy.dashboard.notaDolares(formatMoney(tc * 100, "ARS"))}
          </p>
        ) : null}
      </Reveal>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Reveal index={2} as="section" aria-labelledby="proximos-titulo" className="grid content-start gap-4">
          <SectionHeader
            id="proximos-titulo"
            title={copy.dashboard.proximosCobros.titulo}
            action={
              <Button asChild variant="ghost" size="sm" className="-mr-3 text-muted-foreground hover:text-foreground">
                <Link href="/cobros">
                  {copy.dashboard.proximosCobros.verTodos}
                  <ArrowRight weight="light" aria-hidden />
                </Link>
              </Button>
            }
          />
          {d.proximosCobros.length ? (
            <ul className="divide-y divide-border border-t border-border">
              {d.proximosCobros.map((c) => (
                <CobroRow key={c.id} cobro={c} hoy={d.hoy} tipoCambio={tc} />
              ))}
            </ul>
          ) : (
            <p className="border-t border-border py-8 text-muted-foreground">{copy.dashboard.proximosCobros.vacio}</p>
          )}
        </Reveal>

        <Reveal index={3} as="section" aria-labelledby="semaforo-titulo" className="content-start">
          <SemaforoResumen semaforo={semaforo} config={config} headingId="semaforo-titulo" />
        </Reveal>
      </div>
    </PageContainer>
  );
}

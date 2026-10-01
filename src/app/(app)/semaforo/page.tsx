import type { Metadata } from "next";

import { AlertaCard } from "@/components/app/alerta-card";
import { GraficoMensual } from "@/components/app/grafico-mensual";
import { PageContainer, Reveal, SectionHeader } from "@/components/app/page";
import { TONO_NIVEL } from "@/components/app/presenters";
import { teFaltanTexto, umbralTicks } from "@/components/app/semaforo-resumen";
import { Simulador } from "@/components/app/simulador";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/ui/money";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { copy } from "@/content/copy";
import { formatMoney, formatPorcentaje } from "@/content/format";
import { categoriaVigente } from "@/lib/config/categorias";
import type { CategoriaMonotributo } from "@/lib/domain/types";
import {
  getAlertas,
  getCategoriaActual,
  getCategorias,
  getClientes,
  getConfigFiscal,
  getSemaforo,
  hoyISO,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { simularCobro } from "./actions";

export const metadata: Metadata = { title: copy.semaforo.titulo };

export default async function SemaforoPage() {
  const hoy = hoyISO();
  const [s, config, alertas, actual, categorias, clientes] = await Promise.all([
    getSemaforo(),
    getConfigFiscal(),
    getAlertas(),
    getCategoriaActual(),
    getCategorias(),
    getClientes(),
  ]);
  const siguiente: CategoriaMonotributo | undefined = s.categoriaSiguiente
    ? categoriaVigente(categorias, s.categoriaSiguiente, hoy)
    : undefined;
  const tono = TONO_NIVEL[s.nivel];
  const ticks = umbralTicks(config);
  const t = copy.semaforo;

  return (
    <PageContainer className="grid gap-14 md:gap-20">
      <section aria-labelledby="semaforo-titulo" className="grid gap-10 md:gap-14">
        <Reveal as="header" className="grid gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-eyebrow text-accent">{t.titulo}</p>
            <Badge variant={tono} dot>
              {t.ariaNivel[s.nivel]}
            </Badge>
          </div>
          <h1 id="semaforo-titulo" className="text-display max-w-4xl text-balance">
            {t.tituloPorNivel[s.nivel]}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">{t.bajadaPorNivel[s.nivel]}</p>
        </Reveal>

        <Reveal index={1} className="grid gap-8 rounded-xl border border-border bg-surface p-6 sm:p-10">
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="grid min-w-0 gap-2">
              <p className="text-eyebrow text-muted-foreground">{t.doceMesesLabel}</p>
              <Money cents={s.facturado} size="display" animate className="block truncate" />
            </div>
            <div className="grid gap-2 sm:text-right">
              <p className="text-eyebrow text-muted-foreground">{t.topeLabel}</p>
              <Money cents={s.tope} size="lg" className="text-muted-foreground" />
            </div>
          </div>

          <ProgressMeter
            size="lg"
            value={s.proporcion}
            tone={tono}
            ticks={ticks}
            label={t.ariaNivel[s.nivel]}
            valueText={t.llevas(formatMoney(s.facturado, "ARS"), formatMoney(s.tope, "ARS"))}
          />

          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-border pt-6">
            <p className={cn("text-heading tabular-nums", s.excedido && "text-danger-foreground")}>{teFaltanTexto(s)}</p>
            <p className="text-sm text-muted-foreground tabular-nums">{t.usado(formatPorcentaje(s.proporcion))}</p>
          </div>
          <p className="-mt-4 text-sm text-muted-foreground">{t.doceMeses}</p>
        </Reveal>
      </section>

      <Reveal index={2} as="section" id="categoria" aria-labelledby="categoria-titulo" className="grid scroll-mt-20 gap-5">
        <SectionHeader
          id="categoria-titulo"
          title={t.categoriaLabel}
          action={actual.placeholder ? <Badge variant="warn">{copy.comun.valorDeEjemplo}</Badge> : null}
          className="flex-wrap items-center"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-6 rounded-lg border border-border bg-surface p-6">
            <p className="text-title">{t.categoria(actual.letra)}</p>
            <dl className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <dt className="text-xs text-muted-foreground">{t.topeLabel}</dt>
                <dd>
                  <Money cents={actual.topeAnual} className="font-serif text-2xl font-normal tracking-tight" />
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-xs text-muted-foreground">{t.cuotaLabel}</dt>
                <dd>
                  <Money cents={actual.cuotaMensual} className="font-serif text-2xl font-normal tracking-tight" />
                </dd>
              </div>
            </dl>
          </div>
          <div className="grid content-start gap-6 rounded-lg border border-dashed border-border-strong/60 p-6">
            <p className="text-eyebrow text-muted-foreground">{t.categoriaSiguiente}</p>
            {siguiente ? (
              <>
                <p className="-mt-3 text-title text-muted-foreground">{t.categoria(siguiente.letra)}</p>
                <p className="text-sm leading-relaxed text-muted-foreground tabular-nums">
                  {t.categoriaSiguienteDetalle(
                    siguiente.letra,
                    formatMoney(siguiente.topeAnual, "ARS"),
                    formatMoney(siguiente.cuotaMensual, "ARS"),
                  )}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t.sinCategoriaSiguiente}</p>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal index={3} as="section" aria-labelledby="grafico-titulo" className="grid gap-8">
        <SectionHeader id="grafico-titulo" title={t.graficoTitulo} description={t.doceMesesLabel} />
        <GraficoMensual serie={s.serieMensual} tope={s.tope} />
      </Reveal>

      <div className="grid gap-14 lg:grid-cols-2 lg:gap-10">
        <Reveal index={4} as="section" aria-labelledby="alertas-titulo" className="grid content-start gap-5">
          <SectionHeader id="alertas-titulo" title={t.alertasTitulo} />
          {alertas.length ? (
            <ul className="grid gap-3">
              {alertas.map((a) => (
                <AlertaCard
                  key={a.id}
                  alerta={a}
                  contexto={{ hoy, categoria: s.categoria, cuotaMensual: actual.cuotaMensual, clientes }}
                />
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t.sinAlertas}</p>
          )}
        </Reveal>

        <Reveal index={5} as="section" aria-label={t.simulador.titulo} className="content-start">
          <Simulador simular={simularCobro} ticks={ticks} tope={s.tope} />
        </Reveal>
      </div>
    </PageContainer>
  );
}

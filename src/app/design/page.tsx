import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Info,
  Plus,
  Receipt,
  Trash,
} from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Money } from "@/components/ui/money";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ContrastTable } from "./contrast-table";

export const metadata: Metadata = {
  title: "Sistema de diseño",
  description: "Tokens, tipografía y primitivas de Tope.",
};

const SWATCHES: { group: string; items: { token: string; className: string }[] }[] = [
  {
    group: "Superficies",
    items: [
      { token: "background", className: "bg-background" },
      { token: "surface", className: "bg-surface" },
      { token: "surface-muted", className: "bg-surface-muted" },
      { token: "border", className: "bg-border" },
      { token: "border-strong", className: "bg-border-strong" },
    ],
  },
  {
    group: "Texto",
    items: [
      { token: "foreground", className: "bg-foreground" },
      { token: "muted-foreground", className: "bg-muted-foreground" },
      { token: "subtle-foreground", className: "bg-subtle-foreground" },
    ],
  },
  {
    group: "Acento",
    items: [
      { token: "accent", className: "bg-accent" },
      { token: "accent-hover", className: "bg-accent-hover" },
      { token: "accent-soft", className: "bg-accent-soft" },
      { token: "ring", className: "bg-ring" },
    ],
  },
  {
    group: "Semáforo",
    items: [
      { token: "ok", className: "bg-ok" },
      { token: "ok-soft", className: "bg-ok-soft" },
      { token: "warn", className: "bg-warn" },
      { token: "warn-soft", className: "bg-warn-soft" },
      { token: "danger", className: "bg-danger" },
      { token: "danger-soft", className: "bg-danger-soft" },
    ],
  },
];

const TICKS = [
  { value: 0.7, label: "70 %" },
  { value: 0.9, label: "90 %" },
];

function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="grid gap-10 py-20 md:grid-cols-[13rem_1fr] md:gap-16">
      <header className="grid content-start gap-3">
        <p className="text-eyebrow text-subtle-foreground">{eyebrow}</p>
        <h2 id={id} className="text-heading">
          {title}
        </h2>
        {lead ? <p className="text-sm leading-relaxed text-muted-foreground">{lead}</p> : null}
      </header>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function DesignPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 pb-32 sm:px-10">
      <div className="flex items-center justify-between pt-8">
        <p className="font-serif text-2xl tracking-tight">Tope</p>
        <ThemeToggle />
      </div>

      <header className="grid gap-8 pt-24 pb-20">
        <p className="text-eyebrow text-accent">Sistema de diseño · v1</p>
        <h1 className="text-display max-w-3xl">
          Calma, claridad y <em className="text-accent">cifras</em> que se leen solas.
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
          Las piezas con las que armamos Tope: un fondo cálido, un único acento salvia, un
          semáforo desaturado y la serif para lo que importa. Todo verificado AA, en claro y en
          oscuro.
        </p>
      </header>

      <Separator />

      <Section
        id="paleta"
        eyebrow="01"
        title="Paleta"
        lead="Solo tokens. Nada de hex sueltos en los componentes."
      >
        <div className="grid gap-12">
          {SWATCHES.map((g) => (
            <div key={g.group} className="grid gap-4">
              <h3 className="text-sm font-medium">{g.group}</h3>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {g.items.map((s) => (
                  <li key={s.token} className="grid gap-2.5">
                    <span
                      aria-hidden
                      className={`h-20 rounded-md border border-border ${s.className}`}
                    />
                    <code className="font-mono text-xs text-muted-foreground">--{s.token}</code>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="grid gap-4">
            <h3 className="text-sm font-medium">Contraste del tema activo</h3>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              Calculado en vivo desde las variables CSS. Cambiá el tema arriba a la derecha y se
              recalcula. Texto ≥ 4,5:1; bordes y elementos de interfaz ≥ 3:1.
            </p>
            <ContrastTable />
          </div>
        </div>
      </Section>

      <Separator />

      <Section
        id="tipografia"
        eyebrow="02"
        title="Tipografía"
        lead="Instrument Serif para títulos y cifras protagonistas; Geist para la interfaz."
      >
        <dl className="grid gap-10">
          {[
            { name: "text-display", sample: "Tu tope, bajo control", cls: "text-display" },
            { name: "text-figure-xl", sample: "$ 18.450.000", cls: "text-figure-xl" },
            { name: "text-title", sample: "Cobros de octubre", cls: "text-title" },
            { name: "text-figure-lg", sample: "$ 1.250.000", cls: "text-figure-lg" },
            { name: "text-heading", sample: "Próximo vencimiento", cls: "text-heading" },
          ].map((t) => (
            <div key={t.name} className="grid gap-2">
              <dt className="font-mono text-xs text-subtle-foreground">{t.name}</dt>
              <dd className={t.cls}>{t.sample}</dd>
            </div>
          ))}
          <div className="grid gap-2">
            <dt className="font-mono text-xs text-subtle-foreground">text-base · Geist</dt>
            <dd className="max-w-prose text-base leading-relaxed">
              Facturá en 30 segundos y nunca más te preocupes por el monotributo. Te avisamos antes
              de que te pases de categoría, con tiempo para decidir.
            </dd>
          </div>
          <div className="grid gap-2">
            <dt className="font-mono text-xs text-subtle-foreground">text-eyebrow</dt>
            <dd className="text-eyebrow text-muted-foreground">Últimos 12 meses</dd>
          </div>
        </dl>
      </Section>

      <Separator />

      <Section
        id="botones"
        eyebrow="03"
        title="Botones"
        lead="Primario sólido para una sola acción por vista. Probá el foco con Tab."
      >
        <div className="grid gap-10">
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <Plus weight="light" aria-hidden />
              Nueva factura
            </Button>
            <Button variant="secondary">Ver detalle</Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="danger-ghost">
              <Trash weight="light" aria-hidden />
              Eliminar
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Chico</Button>
            <Button size="md">Mediano</Button>
            <Button size="lg">
              Grande
              <ArrowRight weight="light" aria-hidden />
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="secondary" aria-label="Más información">
                  <Info weight="light" aria-hidden />
                </Button>
              </TooltipTrigger>
              <TooltipContent>El tope se calcula sobre los últimos 12 meses.</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Deshabilitado</Button>
            <Button variant="secondary" disabled>
              Deshabilitado
            </Button>
            <Button variant="ghost" asChild>
              <a href="#botones">Como enlace (asChild)</a>
            </Button>
          </div>
        </div>
      </Section>

      <Separator />

      <Section
        id="formularios"
        eyebrow="04"
        title="Formularios"
        lead="Label arriba, ayuda debajo, error claro con icono y aria-describedby."
      >
        <div className="grid max-w-md gap-7">
          <Field label="Cliente" placeholder="Ej.: Estudio Norte SRL" hint="Como figura en ARCA." />
          <Field
            label="CUIT"
            defaultValue="20-1234567"
            inputMode="numeric"
            error="El CUIT tiene 11 dígitos. Revisalo y probá de nuevo."
          />
          <Field label="Monto" placeholder="0" inputMode="decimal" disabled hint="Deshabilitado" />
        </div>
      </Section>

      <Separator />

      <Section id="cards" eyebrow="05" title="Cards" lead="Borde de 1px, radio 16, sin sombra.">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription className="text-eyebrow">Facturado · 12 meses</CardDescription>
              <Money cents={1845000000} size="xl" animate />
            </CardHeader>
            <CardContent>
              <ProgressMeter
                value={0.62}
                tone="ok"
                label="Uso del tope de la categoría"
                valueText="62 % del tope de la categoría D"
                ticks={TICKS}
              />
            </CardContent>
            <CardFooter className="justify-between">
              <Badge variant="ok" dot>
                En regla
              </Badge>
              <span className="text-sm text-muted-foreground">Categoría D</span>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Próximo vencimiento</CardTitle>
              <CardDescription>Cuota del monotributo de octubre.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-1">
              <Money cents={4235000} size="lg" />
              <span className="text-sm text-muted-foreground">Vence el 20 de octubre</span>
            </CardContent>
            <CardFooter>
              <Button size="sm">Pagar</Button>
              <Button size="sm" variant="ghost">
                Recordarme
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      <Separator />

      <Section id="badges" eyebrow="06" title="Badges" lead="Fondos tenues, texto con contraste AA.">
        <div className="grid gap-5">
          <div className="flex flex-wrap gap-2.5">
            <Badge>Borrador</Badge>
            <Badge variant="accent">Nuevo</Badge>
            <Badge variant="ok">Cobrado</Badge>
            <Badge variant="warn">Por cobrar</Badge>
            <Badge variant="danger">Atrasado</Badge>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Badge dot>Borrador</Badge>
            <Badge variant="accent" dot>
              Nuevo
            </Badge>
            <Badge variant="ok" dot>
              En regla
            </Badge>
            <Badge variant="warn" dot>
              Cerca del tope
            </Badge>
            <Badge variant="danger" dot>
              Te pasaste
            </Badge>
          </div>
        </div>
      </Section>

      <Separator />

      <Section
        id="montos"
        eyebrow="07"
        title="Montos"
        lead="Centavos enteros formateados es-AR. Serif y tabulares de lg en adelante."
      >
        <div className="grid gap-8">
        <dl className="grid gap-8">
          <div className="grid gap-1.5">
            <dt className="font-mono text-xs text-subtle-foreground">display · animate</dt>
            <dd>
              <Money cents={2384750000} size="display" animate />
            </dd>
          </div>
          <div className="grid gap-1.5">
            <dt className="font-mono text-xs text-subtle-foreground">xl · USD</dt>
            <dd>
              <Money cents={480000} currency="USD" size="xl" />
            </dd>
          </div>
          <div className="grid gap-1.5">
            <dt className="font-mono text-xs text-subtle-foreground">lg</dt>
            <dd>
              <Money cents={125000000} size="lg" />
            </dd>
          </div>
        </dl>
          <dl className="grid grid-cols-2 gap-8 sm:max-w-md">
            <div className="grid gap-1.5">
              <dt className="font-mono text-xs text-subtle-foreground">md · con centavos</dt>
              <dd>
                <Money cents={8765432} size="md" />
              </dd>
            </div>
            <div className="grid gap-1.5">
              <dt className="font-mono text-xs text-subtle-foreground">sm · USD</dt>
              <dd>
                <Money cents={123400} currency="USD" size="sm" />
              </dd>
            </div>
          </dl>
        </div>
      </Section>

      <Separator />

      <Section
        id="medidor"
        eyebrow="08"
        title="Medidor"
        lead="Barra de 8px con umbrales marcados. role=meter para lectores de pantalla."
      >
        <div className="grid gap-12">
          {(
            [
              { tone: "ok", value: 0.48, text: "En regla", badge: "ok" },
              { tone: "warn", value: 0.78, text: "Cerca del tope", badge: "warn" },
              { tone: "danger", value: 0.96, text: "Por pasarte", badge: "danger" },
            ] as const
          ).map((m) => (
            <div key={m.tone} className="grid gap-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-figure-lg">{Math.round(m.value * 100)} %</span>
                <Badge variant={m.badge} dot>
                  {m.text}
                </Badge>
              </div>
              <ProgressMeter
                value={m.value}
                tone={m.tone}
                ticks={TICKS}
                label={`Uso del tope: ${m.text}`}
                valueText={`${Math.round(m.value * 100)} % del tope anual`}
              />
            </div>
          ))}
        </div>
      </Section>

      <Separator />

      <Section
        id="estados"
        eyebrow="09"
        title="Carga y vacío"
        lead="Skeletons en vez de spinners. Estados vacíos que invitan a actuar."
      >
        <div className="grid gap-10">
          <Card role="status" aria-busy="true" aria-label="Cargando resumen">
            <CardHeader className="gap-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-12 w-64" />
            </CardHeader>
            <CardContent className="grid gap-3">
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
          <EmptyState
            icon={Receipt}
            title="Todavía no facturaste"
            description="Cuando emitas tu primera factura, acá vas a ver cuánto te queda hasta el tope de tu categoría."
            action={
              <Button>
                <Plus weight="light" aria-hidden />
                Emitir la primera
              </Button>
            }
          />
        </div>
      </Section>
    </main>
  );
}

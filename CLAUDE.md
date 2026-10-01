@AGENTS.md

# Tope — convenciones del proyecto

Webapp para freelancers monotributistas argentinos. Promesa: "Facturá en 30 segundos y nunca más te preocupes por el monotributo."

## Stack
Next.js 16 (App Router) + TypeScript estricto · Tailwind v4 (tokens en `src/app/globals.css`) · componentes estilo shadcn (Radix vía paquete `radix-ui` + CVA + `cn`) en `src/components/ui` · Phosphor Icons (`@phosphor-icons/react`, **siempre `weight="light"`**, importar desde `@phosphor-icons/react/dist/ssr` en Server Components) · Framer Motion · Vitest · Playwright.

El registro de shadcn no es accesible desde el entorno de CI/agentes: los componentes se escriben a mano siguiendo su arquitectura.

## Estructura
- `src/app/globals.css` — design tokens (CSS variables, claro y oscuro). Única fuente de color/tipo/radio.
- `src/components/ui/` — primitivas reutilizables (Button, Input, Card, Badge, Skeleton, EmptyState, Money…).
- `src/components/app/` — piezas de producto (Semáforo, CobroRow, MetricCard, AppShell…).
- `src/lib/domain/types.ts` — contrato del dominio. Montos en **centavos enteros**; fechas ISO.
- `src/lib/fiscal/` — lógica pura (semáforo, 12 meses móviles, reserva de impuestos). Testeada.
- `src/lib/data/` — capa de acceso a datos. Hoy lee del mock; en Fase 2, de Supabase, sin cambiar la firma.
- `src/lib/mock/` — seed realista.
- `src/content/` — copy (voz rioplatense). La UI no inventa textos: los toma de acá.

## Reglas
- Nada de colores hex sueltos en componentes: solo tokens (`bg-surface`, `text-muted-foreground`, `bg-accent`…).
- Topes y cuotas de categorías: solo desde la tabla de configuración (`CategoriaMonotributo`), nunca en lógica.
- Cifras importantes en serif (`font-serif`) con `tabular-nums`.
- Accesibilidad AA: contraste, foco visible (`focus-visible:ring`), labels, navegación por teclado.
- Animaciones 150–250ms; respetar `prefers-reduced-motion`. Skeletons, no spinners.
- Evitar: gradientes, glassmorphism, sombras pesadas, tablas densas.

## Comandos
`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run test:e2e`

# Tope

> Facturá en 30 segundos y nunca más te preocupes por el monotributo.

Webapp para freelancers monotributistas argentinos que trabajan con clientes locales y del exterior.

## Estado: Fase 1 — design system + dashboard + semáforo + cobros (datos mock)

| Ruta | Qué hay |
|---|---|
| `/dashboard` | 4 métricas (cobrado, por cobrar, atrasado, apartá para impuestos) + próximos cobros + resumen del semáforo |
| `/semaforo` | Facturación de 12 meses móviles vs. tope, categoría actual/siguiente, gráfico mensual, alertas y simulador "¿y si cobro…?" |
| `/cobros` | Lista agrupada por mes con filtros por estado |
| `/design` | Vitrina del design system (tokens, contraste AA, componentes) |

Capturas en [`docs/screenshots/`](docs/screenshots/). Guía de voz en [`docs/voz.md`](docs/voz.md).

> ⚠️ Los topes y cuotas de categorías (`src/lib/config/categorias.ts`) son **valores de ejemplo, no oficiales**.

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:3000
npm run test:all     # lint + typecheck + unit (Vitest) + e2e/a11y (Playwright + axe)
```

`TOPE_HOY=YYYY-MM-DD` y `TOPE_HORA=0-23` fijan la fecha/hora para demos y tests.

Convenciones y arquitectura: [`CLAUDE.md`](CLAUDE.md). Agentes del proyecto (diseño, frontend, backend, QA, marketing): [`.claude/agents/`](.claude/agents/).

# Dashboard Operativo — Polish (separación + informativo)

## Objective
Rediseñar el layout del dashboard (`/dashboard`) para separar secciones con jerarquía clara y hacerlo más informativo, sin perder NINGUNA funcionalidad existente.

## Problem
- El dashboard usa ~40 clases de acento (`text-pampa`, `bg-oro`, `border-cielo`, `text-vino`…) que NO están registradas en `@theme` de Tailwind v4 → utilidades muertas, todo se ve plano.
- Overview incompleto: la columna derecha tiene un slot vacío que el comentario del código anuncia como "Dietas y Voluntarios".
- Preview duplica controles completos (búsqueda/filtros) de la tabla en el overview.
- Métrica duplicada ("X de Y presentes" en KPI y en título del preview).
- Estados `cancelled`/`refunded` sin cobertura visual en Ventas; `cancelled` de tickets cae en "No ingresó".
- Dos familias visuales de badges de dieta (outline vs sólido) y chips de iconos inconsistentes.
- Tipografía desigual (h2 de tabs vs h2 del overview), formateo ARS duplicado en 3 archivos.

## Why
Pedido del usuario: "pulir el dashboard… separa las cosas y mejoralo, la idea es que sea más informativo que otra cosa. Las funcionalidades son excelentes pero hay que mejorar."

## Scope (autorizado)
- SOLO el diseño/presentación del dashboard:
  - `app/globals.css` (registrar acentos pampa/oro/cielo/vino en @theme, valores desde AI_CONTEXT.md)
  - `components/dashboard/*` (dashboard-client, kpi-cards, tickets-table, purchases-table, catering-summary, volunteers-ranking, y preview nuevo/compacto si hace falta)
  - `lib/dashboard/types.ts` o helper de formato ARS SI es necesario centralizar (sin tocar service.ts ni mock-data.ts salvo que un cambio de presentación lo exija)
- FUERA de alcance: NO tocar `/validar`, acciones de server, export-utils, service.ts, ni agregar auth (se propone aparte).

## Constraints
- Preservar TODA funcionalidad: toggle DB/mock, exports CSV, tabs (overview/asistentes/ventas/cocina/voluntarios), búsquedas, filtros, podio voluntarios, nómina cocina, progresos, metadata del evento.
- Respetar la paleta de marca (crema #F6EEDD, card #FCF6E9, primary #8A5A26, amber). Registrando los acentos documentados, no cambiar sus valores.
- Mantener límites server/client actuales (page server → client).
- Los acentos pampa/oro/cielo/vino se registran en `@theme`/`:root` con sus valores EXACTOS de `AI_CONTEXT.md` (~L130); verificar ahí antes de escribir.

## Tasks
- [x] T1 — Registrar acentos `pampa`, `oro`, `cielo`, `vino` (+ variantes oscuras coherentes) en globals.css. Evidencia: `tsc` ok + render del dashboard muestra colores vivos. ✅ Valores exactos AI_CONTEXT L130 (pampa #3E8E6A, oro #F7B83A, cielo #4FA3D1, vino #C23A54; dark: #57B588/#F7B83A/#72BCE2/#E06B85). Computed color verificado: rgb(87,181,136) dark pampa.
- [x] T2 — Reestructurar `dashboard-client`: bandera KPI limpia, header con acciones consistentes, overview con DOS previews claros (puerta reciente SIN controles duplicados + columna con Cocina Y Top voluntarios que hoy falta), headers/tipografía de tabs unificados. ✅ TabPageHeader + OverviewSectionHeader (font-display); preview compacto 8 filas sin búsqueda; Top Voluntarios agregado.
- [x] T3 — `kpi-cards`: chips de iconos consistentes, tratar `totalPurchases` y `totalCapacity` de forma informativa, mantener progress bars. ✅ Render verificado (Recaudación/Entradas/Asistencia/Bebidas/Donación presentes).
- [x] T4 — `tickets-table`: barra de controles unificada (búsqueda + filtros estados + dieta), cubrir estado `cancelled` explícito, modo compacto para preview del overview. ✅ Prop `compact` en uso; estado cancelled con badge propio; búsqueda presente en tab completo.
- [x] T5 — `purchases-table`: badges propios para `cancelled`/`refunded` (+ opciones de filtro), barra de controles unificada. ✅ Segmented: Todos/Pagados/Pendientes/Cancelados/Reembolsados; badges Cancelado (muted) / Reembolsado (vino).
- [x] T6 — `catering-summary` y `volunteers-ranking`: unificar familia de badges de dieta con la de la tabla, pulir podio/tabla. ✅ DietBadge compartida (celíaco→oro, vegetariano→pampa, sin carne→cielo); volunteers prop `compact`.
- [x] T7 — Centralizar formato ARS si es barato (sin tocar service). ✅ `lib/dashboard/format.ts` `formatARS()` usado en purchases/kpi/volunteers.

## Progress
- Mapa de estructura completo (explore agent) — hecho.
- Writer T1–T7 — hecho (un solo writer, entregas verificadas por gatekeeper).
- Checks — tsc: 6 errores PRE-EXISTENTES en prisma/seed.ts (marcadores de merge sin resolver, fuera de alcance); 0 errores en archivos tocados. eslint components/dashboard + lib/dashboard/format.ts: 0 problemas. Smoke test Playwright: 17/17 checks funcionales PASS (tabs, exports, KPIs, colores vivos, compact sin duplicados, filtros).
- PENDIENTE (repo del usuario, NO de esta tarea): merge en curso (MERGE_HEAD 71d21d9) — layout.tsx y package.json con texto resuelto pero sin `git add`; prisma/seed.ts conserva 6 marcadores `<<<<<<<` que rompen tsc hasta resolver el merge.
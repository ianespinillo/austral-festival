# Dashboard Acceso — Protección staff + entrada discreta

## Objective
Cerrar `/dashboard` para el público y hacer el acceso sutil: sin link público, entrada discreta solo visible para staff autenticado.

## Problem
- `/dashboard` es público (sin middleware, sin `isStaffAuthed`) — cualquiera con la URL ve recaudación, ventas, DNI de compradores.
- El header público (`layout.tsx:61-66`) enlaza "Dashboard" visiblemente.
- `/validar` YA está protegido con el mismo mecanismo (cookie `staff_auth` httpOnly 8h, `isStaffAuthed()`, `loginStaff`).

## Why
Pedido del usuario: "yo lo mejoraría ocultando algunas cosas o haciendo más sutil el acceso".

## Scope
- `app/dashboard/page.tsx` — gate server-side: `isStaffAuthed()`; si no → `redirect("/validar")`. Mantener `force-dynamic` y todo lo demás intacto.
- `app/layout.tsx` — quitar el `<Link href="/dashboard">` del nav público (líneas ~61-66). NO tocar nada más del nav (navLinkClass, Entradas, Validar, logo, footer).
- `app/validar/page.tsx` — en la rama autenticada (que hoy renderiza `<ValidationPanel/>`), agregar un link discreto "Dashboard operativo" (text-xs, muted, arriba o en la esquina, sin alterar el layout del panel).

## Constraints
- Reutilizar SOLO el mecanismo existente (`isStaffAuthed` de `/lib/staff`). No crear cookies/sesiones nuevas.
- NO tocar `app/actions.ts`, `/lib/staff.ts`, `/components/validar/*`, `/components/dashboard/*`.
- El link discreto SOLO se renderiza en la rama autenticada de /validar.
- No exponer la data del dashboard en la rama no autenticada (el gate debe impedir incluso el fetch si es posible: redirect ANTES de llamar getDashboardData).
- layout.tsx está en medio de un merge del usuario (UU): editar SOLO el bloque exacto del link Dashboard, no reformatear el archivo.

## Tasks
- [ ] T1 — Gate en `app/dashboard/page.tsx`: si `!isStaffAuthed()` → `redirect("/validar")`; el fetch de data queda detrás del gate.
- [ ] T2 — Quitar el link "Dashboard" del nav público en `app/layout.tsx`.
- [ ] T3 — Link discreto "Dashboard operativo" en la vista autenticada de /validar.

## Acceptance criteria
- Visitante anónimo a /dashboard → redirigido a /validar (ve el login, no data).
- Header público sin link Dashboard.
- Staff logueado en /validar ve el link discreto y llega al dashboard.
- `npx tsc --noEmit`: solo los errores pre-existentes de prisma/seed.ts (merge del usuario).

## Checks
- tsc (reportar real).
- Playwright: (1) anónimo /dashboard → login de /validar; (2) header sin link Dashboard; (3) login staff → link discreto visible → /dashboard carga.
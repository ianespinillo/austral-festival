# Contexto del proyecto para IA

> Documento de contexto de código para asistir a agentes/IA que trabajen en este repo.
> Idioma del proyecto: español (código, UI, textos y comentarios).

## Qué es

Landing + sistema de venta de entradas para la **Peña Folklórica de la Universidad Austral** (Pilar, Argentina). Compra por MercadoPago (Checkout Pro), entrega de QR por email, y panel de staff para validar ingresos y controlar consumos de bebida.

## Stack

- **Next.js 16** (App Router, Server Components, `"use server"` actions), **React 19**, **TypeScript 5**.
- **Prisma 5 + MongoDB** (replica set obligatorio para transacciones).
- **MercadoPago SDK** (`mercadopago@3.6.1`), **nodemailer** (SMTP), **qrcode**.
- **Tailwind CSS 4** + shadcn/ui. Fonts: Lato (sans), Rowdies (display).
- Package manager: **pnpm 10**.

## Comandos

```bash
pnpm dev            # dev server (puerto 3000)
pnpm build          # build de producción
pnpm lint           # eslint
pnpm db:push        # sincronizar schema.prisma con MongoDB
pnpm db:seed        # cargar eventos/entradas demo
pnpm db:reset       # push --force-reset + seed
```

Verificación antes de entregar cambios: `npx tsc --noEmit -p tsconfig.json` y `pnpm lint`.

MongoDB local: `docker compose up -d mongodb` (inicia replica set `rs0`).

## Estructura

```
app/
  page.tsx                   Landing + form de compra (Server Component, lee Event/TicketTier)
  actions.ts                 Todas las server actions (compra, staff, check-in, bebidas)
  layout.tsx                 Header/footer + fonts + Toaster (sonner)
  compra/exito/page.tsx      Página post-pago (lee query ?status=&external_reference=)
  validar/page.tsx           Panel staff (login o ValidationPanel)
  api/webhooks/mercadopago/route.ts   Webhook de MercadoPago
lib/
  prisma.ts / mercadopago.ts / email.ts / qr.ts / age.ts / diet.ts / config.ts / staff.ts / utils.ts
components/
  purchase/purchase-form.tsx  Form "use client" que llama a createCheckoutPreference
  validar/*                   Login, qr-scanner (jsqr), validation-panel, ticket-card, ticket-data
  ui/*                        Componentes shadcn
prisma/
  schema.prisma               Modelo de datos
  seed.ts                     Data demo (evento, tier, compras y entradas demo)
```

## Modelo de datos (Prisma + MongoDB)

- `Event` → `TicketTier` → (`Purchase`, `Ticket`)
- `Purchase` → `Ticket[]` → `DrinkRedemption[]`

**Purchase**: `status: "pending" | "paid" | "cancelled" | "refunded"` (por defecto `pending`), `mpPaymentId`, `mpPreferenceId`, `quantity`, `totalAmount`, `guests` (JSON array), `buyerParticipation: "asistir" | "donacion"`, `referringVolunteer`.

**Ticket**: `status: "active" | "used"` (+ el código asume "cancelled"), `qrCode` (formato `TICKET-XXXX-XXXX`), `holderName/Dni/BirthDate`, `alcoholAllowance` (0 si menor de edad), `diet` (`regular | vegetariano | celiaco | sin_carne_viernes`).

Notas MongoDB:
- Los `@db.ObjectId` son `String`, no hay autoincrement ni FK físicas.
- Prisma MongoDB **no soporta** `noLimit`, `relationMode` relajado y requiere `$transaction` solo con replica set.
- `TicketTier.soldCount` se incrementa manualmente al confirmar el pago (no hay constraint de stock atómico).

## Flujo de compra (end to end)

1. `app/page.tsx` lee el primer `Event` activo y sus tiers con stock disponible.
2. `purchase-form.tsx` valida en cliente y llama a `createCheckoutPreference` (`app/actions.ts:33`):
   - Valida cantidad (1-6), email, DNI (6-10 dígitos), fecha nacimiento, dieta.
   - Calcula `alcoholAllowance` por asistente: `DEFAULT_ALCOHOL_ALLOWANCE` (3) si es mayor de edad (18+ al momento de comprar), 0 si es menor.
   - Crea la `Purchase` con `status: "pending"` y guarda los `guests`.
   - Crea la preferencia en MP con `external_reference = purchase.id`, `notification_url = ${APP_URL}/api/webhooks/mercadopago` y `back_urls` hacia `/compra/exito`.
   - Redirige al `init_point` (en sandbox usa `sandbox_init_point`).
3. El comprador paga en Checkout Pro de MP.
4. MP envía webhooks → `app/api/webhooks/mercadopago/route.ts`.
5. `compra/exito` muestra confirmación según `?status=approved&external_reference=<purchaseId>`.

## Webhook de MercadoPago (`app/api/webhooks/mercadopago/route.ts`)

Comportamiento actual (importante no romper):

1. Parseo body: `{ type?, topic?, action?, data: { id }?, id? }`.
2. Firma: si viene `x-signature` (`ts=` + `v1=`), se valida HMAC-SHA256 con `MP_WEBHOOK_SECRET` (manifest `id:<id>;request-id:<x-request-id>;ts:<ts>;`). **Si NO viene firma, se procesa igual** (decisión deliberada: el webhook en producción no está registrado con secreto en el panel de MP). No volver a fallar cerrado.
3. `resolvePayment(contextId, type)` resuelve el pago aprobado:
   - `type === "merchant_order"` (o `topic`): `data.id` es el id de la **merchant order**, no del pago. Se fetchea la orden, se toma el primer pago `approved` de `payments[]` y su `external_reference`.
   - Caso `payment` / sin type: `data.id` ya es el id del pago → `getPaymentById`.
4. Si no hay pago `approved` → responde `{ received: true }` y sale (MP reintentará o mandará el evento de aprobación después).
5. Valida que la purchase exista. Si monto (`transaction_amount`) o email del payer difieren, **solo loguea warning** (no bloquea, para no dejar varado a quien ya pagó).
6. **Claim atómico de idempotencia**: `purchase.updateMany({ where: { id, status: "pending", mpPaymentId: null }, data: { status: "paid", mpPaymentId } })`. Si `count === 0`, ya fue procesado por otro webhook duplicado → `{ received, alreadyHandled }`.
7. `fulfillPurchase`: crea 1 `Ticket` por unidad (con holderName/genérica para donaciones), incrementa `TicketTier.soldCount`, genera QR por ticket y manda el email con `sendEmail`. La creación + `soldCount` van en un `$transaction`. El mail va **después** del commit (best-effort).
8. Si falla tras el claim, revierte la purchase a `pending`/`mpPaymentId null` y devuelve 500 para que MP reintente.

Gotchas de MP:
- Con **Checkout Pro** los webhooks suelen ser `merchant_order` (por eso `resolvePayment` los maneja). Con panel configurado como pagos, son `payment`.
- El `data.id` del body **no se deben usar como fuente de verdad del estado**: siempre re-fetchear desde la API.
- No romper el caso "webhook sin firma": es el que está funcionando en producción.
- `webhookIsValid` recibe el `paymentId` del body; la orden/pago aprobado se resuelve después.

## Panel staff (`/validar` + server actions)

- Login con `STAFF_PASSWORD` (default `peña-demo`); cookie `staff_auth` httpOnly, hash con HMAC. `requireStaff()` lanza error si no autenticado.
- `lookupTicketByCode`: acepta `qrCode` (`TICKET-` o `XXXX-XXXX`) o el contenido JSON del QR (`{ ticketId, type }`).
- `lookupTicketsByDni`: busca por `holderDni`.
- `checkInTicket`: pasa Ticket a `status: "used"` + `checkedInAt`. No permite re-uso.
- `serveDrink` / `undoDrink`: solo si el ticket está `used`; controla que no se supere `alcoholAllowance` para `alcoholic`.

## Email

`lib/email.ts`: nodemailer con `SMTP_HOST/PORT/USER/PASS/EMAIL_FROM`. `sendEmail` manda HTML + adjuntos (PNG de QR). El webhook manda un email por compra con todos los tickets y QR.

## Env vars (ver `.env.example` y `docker-compose.yml`)

```
DATABASE_URL            mongodb://localhost:27017/folk_festival?replicaSet=rs0
MP_ACCESS_TOKEN         token de MP
MP_PUBLIC_KEY           key pública de MP
MP_WEBHOOK_SECRET       secreto de firma (opcional: ver webhook)
NEXT_PUBLIC_APP_URL     base URL pública (back_urls, notification_url)
SMTP_HOST/PORT/USER/PASS/EMAIL_FROM
STAFF_PASSWORD          password del panel staff
```

## Convenciones y notas para la IA

- **No agregar comentarios al código** salvo que se pidan. El código está en español en textos/emails.
- Los textos de UI/emails van en español rioplatense ("conseguí tu entrada", "Validá").
- UI: tema shadcn con colores custom: `pampa` (verde #3E8E6A), `cielo` (azul #4FA3D1), `oro` (#F7B83A), `vino` (primario #C23A54).
- Rutas con `@/` = raíz del repo.
- Server Components por defecto; marcar `"use client"` solo donde se necesita interactividad.
- Al terminar un cambio: correr `npx tsc --noEmit -p tsconfig.json` (funciona en este repo) y `pnpm lint`.
- Preferir `prisma.$transaction` para writes conjuntos (MongoDB replica set).
- El contador `soldCount` no es atómico: no usar como fuente única para anticorrupción; las compras validadas se chequean en `createCheckoutPreference`.
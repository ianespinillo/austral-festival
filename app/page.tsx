import { prisma } from "@/lib/prisma";
import { PurchaseForm } from "@/components/purchase/purchase-form";
import {
  DEFAULT_ALCOHOL_ALLOWANCE,
  DOORS_TEXT,
  PREVENTA_LABEL,
  VENUE_MAPS_URL,
} from "@/lib/config";
import {
  CalendarDays,
  MapPin,
  Clock3,
  Music,
  ShieldCheck,
  Ticket as TicketIcon,
  Wine,
} from "lucide-react";

export const dynamic = "force-dynamic";

const formatPrice = (value: number) =>
  value.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const pennantColors = ["#C23A54", "#F7B83A", "#4FA3D1", "#3E8E6A"];

function Guirnalda() {
  return (
    <div aria-hidden className="mx-auto -mt-2 max-w-3xl px-6">
      <svg viewBox="0 0 640 40" className="w-full text-muted-foreground">
        <path
          d="M0 6 C 90 30, 170 30, 260 6 S 430 6, 520 30 S 640 6, 640 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {Array.from({ length: 11 }).map((_, i) => {
          const x = 40 + i * 52;
          const y = 8 + (i % 2 === 0 ? 0 : 14);
          return (
            <path
              key={i}
              d={`M ${x} ${y} L ${x + 22} ${y + 30} L ${x + 44} ${y} Z`}
              fill={pennantColors[i % pennantColors.length]}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default async function Home() {
  const event = await prisma.event.findFirst({
    include: {
      ticketTiers: { where: { isActive: true }, orderBy: { price: "asc" } },
    },
  });

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">
          Evento no publicado todavía
        </h1>
        <p className="mt-2 text-muted-foreground">
          Volvé pronto, estamos preparando la próxima peña.
        </p>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const tier = event.ticketTiers[0];
  const unitPrice = tier?.price ?? 10000;

  const remaining = (t: { maxStock: number; soldCount: number }) =>
    Math.max(0, t.maxStock - t.soldCount);

  const dateLabel = eventDate.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 size-80 rounded-full bg-cielo/30 blur-3xl" />
          <div className="absolute top-8 -right-16 size-72 rounded-full bg-oro/40 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 size-72 rounded-full bg-vino/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary ring-1 ring-primary/20">
            <Music className="size-3.5" /> Peña Folklórica · Universidad Austral
          </p>

          <div className="relative">
            <div className="absolute -top-6 right-0 hidden rotate-6 md:block">
              <div className="grid size-36 place-items-center rounded-full bg-oro text-center text-accent-foreground shadow-lg ring-2 ring-dashed ring-accent-foreground/30 ring-offset-4 ring-offset-background">
                <div>
                  <div className="font-display text-xs font-bold uppercase tracking-wide">
                    {PREVENTA_LABEL}
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold">
                    {formatPrice(unitPrice)}
                  </div>
                </div>
              </div>
            </div>

            <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              <span className="block text-primary">
                Una noche de folklore,
              </span>
              <span className="block text-cielo">
                baile, canto y amigos,
              </span>
              <span className="block text-foreground">en Mariano Acosta 1610, Pilar.</span>
            </h1>
          </div>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {event.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm font-semibold">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-secondary-foreground">
              <CalendarDays className="size-4" /> {dateLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-secondary-foreground">
              <Clock3 className="size-4" /> {DOORS_TEXT}
            </span>
            <a
              href={VENUE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-secondary-foreground transition-colors hover:bg-secondary/70 hover:underline"
            >
              <MapPin className="size-4" /> {event.venue}
            </a>
            <span className="font-display text-sm font-bold text-pampa md:hidden">
              {PREVENTA_LABEL} · {formatPrice(unitPrice)}
            </span>
          </div>
        </div>
      </section>

      <Guirnalda />

      <section
        id="entradas"
        className="scroll-mt-20 py-14 sm:py-20"
      >
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <p className="font-display text-sm font-bold uppercase tracking-widest text-pampa">
              Entradas
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Conseguí tu entrada hoy
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Pagá con Mercado Pago y recibí tu QR por email al instante.
              Disponibles en {PREVENTA_LABEL}. Una sola entrada, la que da todo:
              música, patio de comidas y {DEFAULT_ALCOHOL_ALLOWANCE} bebidas
              alcohólicas.
            </p>
          </div>

          <PurchaseForm
            tiers={event.ticketTiers.map((t) => ({
              id: t.id,
              name: t.name,
              price: t.price,
              remaining: remaining(t),
            }))}
          />
        </div>
      </section>

      <section className="border-t-2 border-dashed border-border/80 bg-secondary/50">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="grid size-10 place-items-center rounded-full bg-pampa text-white">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold">
                Pago seguro
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Procesado por Mercado Pago, con todos los medios de pago de
                Argentina. No está permitida la venta a menores de edad.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="grid size-10 place-items-center rounded-full bg-cielo text-white">
                <TicketIcon className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold">
                QR al instante
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Recibís tu código QR por email apenas confirmamos el pago.
                Presentá tu QR en la entrada.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="grid size-10 place-items-center rounded-full bg-vino text-white">
                <Wine className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold">
                {DEFAULT_ALCOHOL_ALLOWANCE} consumos
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Cada entrada incluye {DEFAULT_ALCOHOL_ALLOWANCE} bebidas
                alcohólicas. Los menores de edad no acceden a bebidas
                alcohólicas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
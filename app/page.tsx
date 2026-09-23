import Image from "next/image";
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

function MinimalDivider() {
  return (
    <div aria-hidden className="mx-auto flex max-w-3xl items-center justify-center gap-4 px-6 py-6">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      <div className="flex items-center gap-2 text-amber-400/80">
        <span className="size-1 rotate-45 border border-amber-400/60" />
        <span className="size-1.5 rotate-45 border border-amber-400 bg-amber-400" />
        <span className="size-1 rotate-45 border border-amber-400/60" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
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
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-widest text-foreground">
          Evento no publicado todavía
        </h1>
        <p className="mt-3 text-xs font-light uppercase tracking-[0.25em] text-muted-foreground">
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
  });

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background Image: Soft illuminated plum wash with acoustic folk warmth */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image
            src="/folk-hero.jpg"
            alt="Fondo de peña folklórica con guitarras e instrumentos acústicos"
            fill
            priority
            className="object-cover object-center contrast-105 brightness-95 saturate-110 opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#361E32]/75 via-[#361E32]/85 to-[#361E32]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#361E32_85%)]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32 text-center">
          {/* Tag / Pre-heading */}
          <div className="inline-flex items-center gap-2.5 border border-amber-400/30 bg-[#4A2C45]/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300 shadow-sm backdrop-blur">
            <Music className="size-3 text-amber-400" strokeWidth={1.5} />
            <span>Peña Folklórica · Universidad Austral</span>
          </div>

          {/* Main Headline */}
          <h1 className="mx-auto mt-8 max-w-4xl font-serif text-4xl font-bold uppercase tracking-wider text-foreground sm:text-6xl lg:text-7xl leading-[1.12]">
            Una noche de folklore, baile, canto y amigos
          </h1>

          <p className="mt-4 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-amber-400 sm:text-sm">
            En Mariano Acosta 1611, Pilar
          </p>

          <p className="mx-auto mt-6 max-w-2xl font-sans text-sm font-normal leading-relaxed text-foreground/80 sm:text-base">
            {event.description}
          </p>

          {/* Centered details dock - Row 1: Date, Doors, Venue. Row 2: Price & Preventa centered */}
          <div className="mx-auto mt-10 w-full max-w-4xl overflow-hidden rounded-sm border border-border bg-[#4A2C45]/95 shadow-2xl backdrop-blur">
            {/* Fila 1: Día, Horarios y Ubicación en una sola fila */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border border-b border-border">
              <div className="flex items-center justify-center gap-2.5 px-4 py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-foreground text-center">
                <CalendarDays className="size-4 text-amber-400 shrink-0" strokeWidth={1.5} />
                <span>{dateLabel}</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 px-4 py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-foreground text-center">
                <Clock3 className="size-4 text-amber-400 shrink-0" strokeWidth={1.5} />
                <span>{DOORS_TEXT}</span>
              </div>
              <a
                href={VENUE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-4 py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-foreground transition-colors hover:text-amber-300 hover:bg-white/5 text-center"
              >
                <MapPin className="size-4 text-amber-400 shrink-0" strokeWidth={1.5} />
                <span className="truncate">{event.venue}</span>
              </a>
            </div>

            {/* Fila 2: Precio con texto de preventa abajo centrado */}
            <div className="flex flex-wrap items-center justify-center gap-3 bg-[#3D233B] px-6 py-4 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                <TicketIcon className="size-3.5 text-amber-400 shrink-0" strokeWidth={1.5} />
                <span>{PREVENTA_LABEL}</span>
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight text-amber-300 sm:text-3xl">
                {formatPrice(unitPrice)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <MinimalDivider />

      {/* Tickets / Purchase Section */}
      <section id="entradas" className="scroll-mt-16 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
              Entradas
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold uppercase tracking-wider text-foreground sm:text-5xl">
              Conseguí tu entrada hoy
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm font-normal leading-relaxed text-foreground/80">
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

      {/* Trust & Details: 3-column clean line-divided block */}
      <section className="border-t border-b border-border bg-[#2A1527]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid divide-y divide-border border border-border bg-[#42263D] sm:grid-cols-3 sm:divide-y-0 sm:divide-x shadow-md">
            <div className="flex flex-col items-center p-8 text-center sm:p-10">
              <div className="grid size-12 place-items-center rounded-sm border border-amber-400/30 bg-amber-500/10 text-amber-400">
                <ShieldCheck className="size-6 text-amber-400" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 font-serif text-base font-bold uppercase tracking-widest text-foreground">
                Pago seguro
              </h3>
              <p className="mt-3 text-xs font-normal leading-relaxed text-muted-foreground">
                Procesado por Mercado Pago, con todos los medios de pago de
                Argentina. No está permitida la venta a menores de edad.
              </p>
            </div>
            <div className="flex flex-col items-center p-8 text-center sm:p-10">
              <div className="grid size-12 place-items-center rounded-sm border border-amber-400/30 bg-amber-500/10 text-amber-400">
                <TicketIcon className="size-6 text-amber-400" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 font-serif text-base font-bold uppercase tracking-widest text-foreground">
                QR al instante
              </h3>
              <p className="mt-3 text-xs font-normal leading-relaxed text-muted-foreground">
                Recibís tu código QR por email apenas confirmamos el pago.
                Presentá tu QR en la entrada.
              </p>
            </div>
            <div className="flex flex-col items-center p-8 text-center sm:p-10">
              <div className="grid size-12 place-items-center rounded-sm border border-amber-400/30 bg-amber-500/10 text-amber-400">
                <Wine className="size-6 text-amber-400" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 font-serif text-base font-bold uppercase tracking-widest text-foreground">
                {DEFAULT_ALCOHOL_ALLOWANCE} consumos
              </h3>
              <p className="mt-3 text-xs font-normal leading-relaxed text-muted-foreground">
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

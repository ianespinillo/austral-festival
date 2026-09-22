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
      <div className="h-px flex-1 bg-white/15" />
      <div className="flex items-center gap-2 text-white/40">
        <span className="size-1 rotate-45 border border-white/60" />
        <span className="size-1.5 rotate-45 border border-white" />
        <span className="size-1 rotate-45 border border-white/60" />
      </div>
      <div className="h-px flex-1 bg-white/15" />
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
        <h1 className="font-serif text-2xl font-bold uppercase tracking-widest text-white">
          Evento no publicado todavía
        </h1>
        <p className="mt-3 text-xs font-light uppercase tracking-[0.25em] text-white/60">
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
    <div className="bg-[#080407] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10">
        {/* Background Image: Underexposed and Desaturated */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image
            src="/folk-hero.jpg"
            alt="Fondo de instrumentos folklóricos en penumbra"
            fill
            priority
            className="object-cover object-center grayscale contrast-125 brightness-[0.22] opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080407]/90 via-[#180516]/80 to-[#080407]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#080407_85%)]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32 text-center">
          {/* Tag / Pre-heading */}
          <div className="inline-flex items-center gap-2.5 border border-white/20 bg-black/40 px-4 py-1.5 text-[11px] font-light uppercase tracking-[0.3em] text-white backdrop-blur">
            <Music className="size-3 text-white" strokeWidth={1.5} />
            <span>Peña Folklórica · Universidad Austral</span>
          </div>

          {/* Main Headline */}
          <h1 className="mx-auto mt-8 max-w-4xl font-serif text-4xl font-bold uppercase tracking-wider text-white sm:text-6xl lg:text-7xl leading-[1.12]">
            Una noche de folklore, baile, canto y amigos
          </h1>

          <p className="mt-4 font-sans text-xs font-light uppercase tracking-[0.25em] text-white/75 sm:text-sm">
            En Mariano Acosta 1610, Pilar
          </p>

          <p className="mx-auto mt-6 max-w-2xl font-sans text-sm font-light leading-relaxed text-white/70 sm:text-base">
            {event.description}
          </p>

          {/* Centered details bar separated by fine white lines */}
          <div className="mt-12 inline-flex flex-wrap items-center justify-center divide-y divide-white/15 border border-white/20 bg-[#140512]/90 backdrop-blur sm:divide-y-0 sm:divide-x">
            <div className="flex items-center gap-2 px-5 py-3 text-xs font-light uppercase tracking-[0.2em] text-white/90">
              <CalendarDays className="size-3.5 text-white" strokeWidth={1.5} />
              <span>{dateLabel}</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 text-xs font-light uppercase tracking-[0.2em] text-white/90">
              <Clock3 className="size-3.5 text-white" strokeWidth={1.5} />
              <span>{DOORS_TEXT}</span>
            </div>
            <a
              href={VENUE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 text-xs font-light uppercase tracking-[0.2em] text-white/90 transition-colors hover:text-white hover:bg-white/5"
            >
              <MapPin className="size-3.5 text-white" strokeWidth={1.5} />
              <span>{event.venue}</span>
            </a>
            <div className="flex items-center gap-2 px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white bg-white/5">
              <span>{PREVENTA_LABEL}</span>
              <span className="font-serif text-sm font-bold tracking-normal">
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
            <p className="text-xs font-light uppercase tracking-[0.3em] text-white/60">
              Entradas
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold uppercase tracking-wider text-white sm:text-5xl">
              Conseguí tu entrada hoy
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm font-light leading-relaxed text-white/70">
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
      <section className="border-t border-b border-white/15 bg-[#10040e]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid divide-y divide-white/15 border border-white/15 bg-[#150513] sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
            <div className="flex flex-col items-center p-8 text-center sm:p-10">
              <div className="grid size-12 place-items-center rounded-sm border border-white/30 text-white">
                <ShieldCheck className="size-6 text-white" strokeWidth={1.25} />
              </div>
              <h3 className="mt-6 font-serif text-base font-bold uppercase tracking-widest text-white">
                Pago seguro
              </h3>
              <p className="mt-3 text-xs font-light leading-relaxed text-white/60">
                Procesado por Mercado Pago, con todos los medios de pago de
                Argentina. No está permitida la venta a menores de edad.
              </p>
            </div>
            <div className="flex flex-col items-center p-8 text-center sm:p-10">
              <div className="grid size-12 place-items-center rounded-sm border border-white/30 text-white">
                <TicketIcon className="size-6 text-white" strokeWidth={1.25} />
              </div>
              <h3 className="mt-6 font-serif text-base font-bold uppercase tracking-widest text-white">
                QR al instante
              </h3>
              <p className="mt-3 text-xs font-light leading-relaxed text-white/60">
                Recibís tu código QR por email apenas confirmamos el pago.
                Presentá tu QR en la entrada.
              </p>
            </div>
            <div className="flex flex-col items-center p-8 text-center sm:p-10">
              <div className="grid size-12 place-items-center rounded-sm border border-white/30 text-white">
                <Wine className="size-6 text-white" strokeWidth={1.25} />
              </div>
              <h3 className="mt-6 font-serif text-base font-bold uppercase tracking-widest text-white">
                {DEFAULT_ALCOHOL_ALLOWANCE} consumos
              </h3>
              <p className="mt-3 text-xs font-light leading-relaxed text-white/60">
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
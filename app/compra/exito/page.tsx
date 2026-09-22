import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ReconcilePoller } from "@/components/purchase/reconcile-poller";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { dietLabel } from "@/lib/diet";
import {
  DEFAULT_ALCOHOL_ALLOWANCE,
  DOORS_TEXT,
  VENUE_MAPS_URL,
} from "@/lib/config";
import {
  MailCheck,
  CircleCheck,
  CircleAlert,
  Ticket as TicketIcon,
  ShieldCheck,
  Wine,
  CalendarDays,
  MapPin,
  Clock3,
  QrCode,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompraExitosaPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    external_reference?: string;
    payment_id?: string;
  }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "approved";
  const purchaseId = params.external_reference;
  const paymentId = params.payment_id;

  const purchaseInclude = {
    tier: { include: { event: true } },
    tickets: { orderBy: { createdAt: "asc" } },
  } as const;

  let purchase = null;
  if (purchaseId) {
    purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: purchaseInclude,
    });
  }

  const isApproved = status === "approved";
  const isDonation = purchase?.buyerParticipation === "donacion";

  const needsReconciliation =
    isApproved && !!purchase && purchase.status !== "paid";

  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <Card className="border border-white/15 bg-[#12040f] text-white shadow-2xl">
        <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
          <div className="grid size-16 place-items-center rounded-full border border-white/25 bg-white/5 text-white">
            {isApproved ? (
              <CircleCheck className="size-8 text-white" strokeWidth={1.25} />
            ) : (
              <CircleAlert className="size-8 text-white" strokeWidth={1.25} />
            )}
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-white sm:text-4xl">
              {isApproved
                ? isDonation
                  ? "¡Gracias por donar!"
                  : "¡Compra confirmada!"
                : "Pago pendiente"}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-xs font-light uppercase tracking-[0.15em] text-white/70 leading-relaxed">
              {isApproved
                ? needsReconciliation
                  ? "Confirmando el pago con Mercado Pago…"
                  : `Revisá tu email: enviamos ${
                      purchase ? `${purchase.quantity} entrada(s)` : "las entradas"
                    } con su código QR.`
                : "Tu pago quedó pendiente. Apenas se acredite, recibirás tus entradas por email."}
            </p>
          </div>

          {needsReconciliation && (
            <ReconcilePoller
              purchaseId={purchaseId!}
              paymentId={paymentId}
            />
          )}

          {isApproved && purchase && purchase.status === "paid" && (
            <>
              {/* Detalle de la venta */}
              <div className="w-full border border-white/15 bg-[#1b0618] px-6 py-5 text-left text-sm">
                <p className="text-[11px] font-light uppercase tracking-[0.25em] text-white/50">
                  Detalle de la venta
                </p>
                <div className="mt-3 space-y-2 text-xs">
                  <p className="flex items-center justify-between gap-3 font-light text-white/80">
                    <span>
                      {purchase.quantity} × {purchase.tier.name}
                    </span>
                    <span className="font-medium text-white">
                      ${purchase.totalAmount.toLocaleString("es-AR")}
                    </span>
                  </p>
                  <p className="flex items-center justify-between gap-3 font-light text-white/80">
                    <span>Precio por entrada</span>
                    <span className="font-medium text-white">
                      ${purchase.tier.price.toLocaleString("es-AR")}
                    </span>
                  </p>
                  <Separator className="bg-white/10" />
                  <p className="flex items-center gap-2 font-light text-white/70">
                    <MailCheck className="size-3.5 text-white" strokeWidth={1.5} /> Enviadas a{" "}
                    <span className="font-medium text-white">
                      {purchase.buyerEmail}
                    </span>
                  </p>
                  {purchase.referringVolunteer && (
                    <p className="font-light text-white/70">
                      Viene de parte de{" "}
                      <span className="font-medium text-white">
                        {purchase.referringVolunteer}
                      </span>
                    </p>
                  )}
                </div>

                {!isDonation && purchase.tickets.length > 0 && (
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="text-[11px] font-light uppercase tracking-[0.25em] text-white/50">
                      Asistentes
                    </p>
                    <div className="mt-2 space-y-1.5 text-xs font-light text-white/80">
                      {purchase.tickets.map((t) => (
                        <p key={t.id}>
                          <span className="font-medium text-white">
                            {t.holderName}
                          </span>{" "}
                          · DNI {t.holderDni} · {dietLabel(t.diet)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Info columns */}
              <div className="w-full space-y-3 text-left">
                {!isDonation && (
                  <div className="flex items-start gap-3 border border-white/15 bg-white/5 p-4">
                    <QrCode className="mt-0.5 size-4 shrink-0 text-white" strokeWidth={1.5} />
                    <p className="text-xs font-light leading-relaxed text-white/80">
                      <strong className="font-semibold text-white uppercase tracking-wider">Presentá tu QR en la entrada.</strong> Cada
                      entrada tiene su propio código y corresponde a un
                      asistente.
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-3 border border-white/15 bg-white/5 p-4">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-white" strokeWidth={1.5} />
                  <p className="text-xs font-light leading-relaxed text-white/80">
                    <strong className="font-semibold text-white uppercase tracking-wider">Pago seguro.</strong> Procesado por Mercado Pago. No
                    está permitida la venta a menores de edad.
                  </p>
                </div>
                {!isDonation && (
                  <div className="flex items-start gap-3 border border-white/15 bg-white/5 p-4">
                    <Wine className="mt-0.5 size-4 shrink-0 text-white" strokeWidth={1.5} />
                    <p className="text-xs font-light leading-relaxed text-white/80">
                      <strong className="font-semibold text-white uppercase tracking-wider">
                        {DEFAULT_ALCOHOL_ALLOWANCE} consumos por entrada.
                      </strong>{" "}
                      Los menores de edad no acceden a bebidas alcohólicas.
                    </p>
                  </div>
                )}
              </div>

              {/* Datos del evento */}
              <div className="w-full space-y-2 border border-white/15 bg-[#170514] p-5 text-left text-xs">
                <p className="flex items-center gap-2 font-serif text-sm font-bold uppercase tracking-wider text-white">
                  <TicketIcon className="size-4 text-white" strokeWidth={1.5} /> {purchase.tier.event.name}
                </p>
                <p className="flex items-center gap-2 font-light text-white/70">
                  <CalendarDays className="size-3.5 text-white" strokeWidth={1.5} />
                  {new Date(purchase.tier.event.date).toLocaleString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="flex items-center gap-2 font-light text-white/70">
                  <Clock3 className="size-3.5 text-white" strokeWidth={1.5} /> {DOORS_TEXT}
                </p>
                <a
                  href={VENUE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-light text-white/70 transition-colors hover:text-white hover:underline"
                >
                  <MapPin className="size-3.5 text-white" strokeWidth={1.5} /> {purchase.tier.event.venue}
                </a>
                {isDonation && (
                  <Badge variant="outline" className="mt-1 border-white/30 text-[10px] font-light uppercase tracking-widest text-white">
                    Entradas donadas · quedan a cargo de la organización
                  </Badge>
                )}
              </div>
            </>
          )}

          <Link
            href="/"
            className="mt-4 text-xs font-light uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white hover:underline underline-offset-8"
          >
            Volver a la página principal
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
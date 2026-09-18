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
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Card className={isApproved ? "border-pampa/50" : ""}>
        <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
          {isApproved ? (
            <CircleCheck className="h-14 w-14 text-pampa" />
          ) : (
            <CircleAlert className="h-14 w-14 text-amber-600" />
          )}
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {isApproved
                ? isDonation
                  ? "¡Gracias por donar!"
                  : "¡Compra confirmada!"
                : "Pago pendiente"}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
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
              <div className="w-full rounded-2xl bg-muted px-5 py-4 text-left text-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Detalle de la venta
                </p>
                <div className="mt-3 space-y-1.5">
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      {purchase.quantity} × {purchase.tier.name}
                    </span>
                    <span className="font-semibold">
                      ${purchase.totalAmount.toLocaleString("es-AR")}
                    </span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Precio por entrada</span>
                    <span className="font-semibold">
                      ${purchase.tier.price.toLocaleString("es-AR")}
                    </span>
                  </p>
                  <Separator />
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <MailCheck className="h-3.5 w-3.5" /> Enviadas a{" "}
                    <span className="font-medium text-foreground">
                      {purchase.buyerEmail}
                    </span>
                  </p>
                  {purchase.referringVolunteer && (
                    <p className="text-muted-foreground">
                      Viene de parte de{" "}
                      <span className="font-medium text-foreground">
                        {purchase.referringVolunteer}
                      </span>
                    </p>
                  )}
                </div>

                {!isDonation && purchase.tickets.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Asistentes
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {purchase.tickets.map((t) => (
                        <p key={t.id} className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {t.holderName}
                          </span>{" "}
                          · DNI {t.holderDni} · {dietLabel(t.diet)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Info grande del evento */}
              <div className="w-full space-y-3 text-left">
                {!isDonation && (
                  <div className="flex items-start gap-3 rounded-2xl border border-cielo/40 bg-secondary/40 p-4">
                    <QrCode className="mt-0.5 size-5 shrink-0 text-cielo" />
                    <p className="text-sm">
                      <strong>Presentá tu QR en la entrada.</strong> Cada
                      entrada tiene su propio código y corresponde a un
                      asistente.
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-3 rounded-2xl border border-pampa/40 bg-secondary/40 p-4">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-pampa" />
                  <p className="text-sm">
                    <strong>Pago seguro.</strong> Procesado por Mercado Pago. No
                    está permitida la venta a menores de edad.
                  </p>
                </div>
                {!isDonation && (
                  <div className="flex items-start gap-3 rounded-2xl border border-vino/40 bg-secondary/40 p-4">
                    <Wine className="mt-0.5 size-5 shrink-0 text-vino" />
                    <p className="text-sm">
                      <strong>
                        {DEFAULT_ALCOHOL_ALLOWANCE} consumos por entrada.
                      </strong>{" "}
                      Los menores de edad no acceden a bebidas alcohólicas.
                    </p>
                  </div>
                )}
              </div>

              {/* Datos del evento */}
              <div className="w-full space-y-2 rounded-2xl border border-border bg-card p-5 text-left text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  <TicketIcon className="size-4" /> {purchase.tier.event.name}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="size-4" />
                  {new Date(purchase.tier.event.date).toLocaleString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Clock3 className="size-4" /> {DOORS_TEXT}
                </p>
                <a
                  href={VENUE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground hover:underline"
                >
                  <MapPin className="size-4" /> {purchase.tier.event.venue}
                </a>
                {isDonation && (
                  <Badge variant="outline" className="mt-1">
                    Entradas donadas · quedan a cargo de la organización
                  </Badge>
                )}
              </div>
            </>
          )}

          <Link
            href="/"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Volver a la página principal
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
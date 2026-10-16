"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCheckoutPreference } from "@/app/actions";
import { DIET_OPTIONS, dietLabel } from "@/lib/diet";
import { DEFAULT_ALCOHOL_ALLOWANCE, PREVENTA_LABEL } from "@/lib/config";
import { cn } from "@/lib/utils";
import { savePurchaseDraft, takePurchaseDraft } from "@/lib/purchase-draft";
import {
  Loader2,
  Music,
  UserRound,
  CheckCircle2,
  Gift,
  Heart,
  Users,
  Ticket as TicketIcon,
  Sparkles,
} from "lucide-react";

export interface TierOption {
  id: string;
  name: string;
  price: number;
  ticketCount: number;
  remaining: number;
}

export interface PurchaseFormProps {
  tiers: TierOption[];
  stageName?: string;
  deadlineLabel?: string;
  shortDeadline?: string;
  isClosed?: boolean;
}

interface GuestInput {
  name: string;
  dni: string;
  birthDate: string;
  diet: string;
}

type Participation = "asistir" | "donacion";

const formatPrice = (value: number) =>
  value.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const PARTICIPATION_OPTIONS: {
  value: Participation;
  title: string;
  desc: string;
  icon: typeof CheckCircle2;
}[] = [
  {
    value: "asistir",
    title: "Asistir al evento",
    desc: "Completás los datos de cada persona que viene",
    icon: CheckCircle2,
  },
  {
    value: "donacion",
    title: "Solo donar entradas",
    desc: "La organización entrega las entradas que donés",
    icon: Gift,
  },
];

function makeEmptyGuest(): GuestInput {
  return { name: "", dni: "", birthDate: "", diet: "regular" };
}

function resizeGuests(prev: GuestInput[], newLen: number): GuestInput[] {
  if (prev.length === newLen) return prev;
  if (prev.length > newLen) return prev.slice(0, newLen);
  return [...prev, ...Array.from({ length: newLen - prev.length }, makeEmptyGuest)];
}

export function PurchaseForm({
  tiers,
  stageName = PREVENTA_LABEL,
  deadlineLabel,
  isClosed = false,
}: PurchaseFormProps) {
  const router = useRouter();

  const individualTier = tiers.find((t) => t.ticketCount === 1) ?? tiers[0];
  const packTier = tiers.find((t) => t.ticketCount > 1) ?? null;

  const [selectedTierId, setSelectedTierId] = useState(individualTier?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [participation, setParticipation] = useState<Participation>("asistir");
  const [referringVolunteer, setReferringVolunteer] = useState("");
  const [guests, setGuests] = useState<GuestInput[]>([makeEmptyGuest()]);
  const [loading, setLoading] = useState(false);

  // Al volver de Mercado Pago sin pagar (botón "atrás" del navegador o
  // back_url de cancelación), restaurar los datos cargados y avisar.
  useEffect(() => {
    function restoreCancelledCheckout() {
      const url = new URL(window.location.href);
      const cancelledByMp = url.searchParams.get("pago") === "cancelado";
      const draft = takePurchaseDraft();
      if (!draft && !cancelledByMp) return;

      if (draft) {
        const fallbackTier = tiers.find((t) => t.ticketCount === 1) ?? tiers[0];
        const restoredTier =
          tiers.find((t) => t.id === draft.selectedTierId) ?? fallbackTier;
        const restoredQty =
          (restoredTier?.ticketCount ?? 1) > 1
            ? 1
            : Math.min(Math.max(Math.floor(draft.quantity) || 1, 1), 6);

        setSelectedTierId(restoredTier?.id ?? "");
        setQuantity(restoredQty);
        setBuyerName(draft.buyerName ?? "");
        setBuyerEmail(draft.buyerEmail ?? "");
        setParticipation(draft.participation === "donacion" ? "donacion" : "asistir");
        setReferringVolunteer(draft.referringVolunteer ?? "");
        setGuests(
          resizeGuests(
            Array.isArray(draft.guests) ? draft.guests : [],
            restoredQty * (restoredTier?.ticketCount ?? 1)
          )
        );
      }
      setLoading(false);

      if (cancelledByMp) {
        url.searchParams.delete("pago");
        window.history.replaceState(window.history.state, "", url);
      }

      toast.dismiss();
      toast.warning("Se canceló la transacción", { id: "pago-cancelado" });
      document.getElementById("entradas")?.scrollIntoView({ block: "start" });
    }

    restoreCancelledCheckout();

    // Si el navegador restaura la página desde el bfcache, el efecto no se
    // vuelve a montar: escuchamos pageshow para detectar ese "atrás".
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) restoreCancelledCheckout();
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [tiers]);

  const tier =tiers.find((t) => t.id === selectedTierId) ?? individualTier;
  const isPack = (tier?.ticketCount ?? 1) > 1;
  const effectiveQty = isPack ? 1 : quantity;
  const totalTickets = effectiveQty * (tier?.ticketCount ?? 1);

  const soldOut = !tier || tier.remaining === 0;
  const total = (tier?.price ?? 0) * effectiveQty;
  const attending = participation === "asistir";

  function handleParticipationChange(value: Participation) {
    setParticipation(value);
    // Pack only makes sense for attendees — reset to individual on donation
    if (value === "donacion") {
      setSelectedTierId(individualTier?.id ?? "");
      setGuests((prev) => resizeGuests(prev, quantity));
    }
  }

  // When switching tiers, resize guests accordingly
  function handleTierChange(tierId: string) {
    setSelectedTierId(tierId);
    const t = tiers.find((x) => x.id === tierId);
    const newQty = (t?.ticketCount ?? 1) > 1 ? 1 : quantity;
    const newTotal = newQty * (t?.ticketCount ?? 1);
    setGuests((prev) => resizeGuests(prev, newTotal));
    if ((t?.ticketCount ?? 1) > 1) setQuantity(1);
  }

  const updateGuest = (index: number, field: keyof GuestInput, value: string) => {
    setGuests((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    );
  };

  const handleQuantityChange = (value: string | null) => {
    const n = Number(value);
    if (!n) return;
    setQuantity(n);
    setGuests((prev) => resizeGuests(prev, n));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tier) return;

    if (attending) {
      const dnis = guests
        .map((g) => g.dni?.trim().replace(/\D/g, ""))
        .filter(Boolean);
      const unique = new Set(dnis);
      if (unique.size !== dnis.length) {
        toast.error("No podés ingresar el mismo DNI para más de un asistente.");
        return;
      }
    }

    setLoading(true);
    try {
      const result = await createCheckoutPreference({
        tierId: tier.id,
        quantity: effectiveQty,
        buyerName,
        buyerEmail,
        participation,
        referringVolunteer,
        guests: attending ? guests : [],
      });
      if (!result.ok || !result.data) {
        toast.error(result.error ?? "Ocurrió un error.");
        return;
      }
      savePurchaseDraft({
        selectedTierId: tier.id,
        quantity: effectiveQty,
        buyerName,
        buyerEmail,
        participation,
        referringVolunteer,
        guests,
      });
      if (result.data.initPoint.startsWith("http")) {
        window.location.href = result.data.initPoint;
      } else {
        router.push(result.data.initPoint);
      }
      toast.success("Redirigiendo a Mercado Pago…");
    } finally {
      setLoading(false);
    }
  }

  if (isClosed) {
    return (
      <div className="purchase-form mx-auto">
        <div className="purchase-ticket border border-border p-8 text-center text-muted-foreground">
          <p className="font-serif text-xl font-bold text-foreground">
            Venta anticipada online finalizada
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Las entradas ahora se adquieren directamente en puerta el día del evento.
          </p>
        </div>
      </div>
    );
  }

  if (!tier) {
    return (
      <div className="purchase-form mx-auto">
        <div className="purchase-ticket border border-border p-8 text-center text-base text-muted-foreground shadow-sm">
          No hay entradas a la venta por ahora.
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="purchase-form mx-auto">
      <div className="purchase-ticket overflow-hidden border border-border">
        {/* Ticket Top Banner */}
        <div className="purchase-banner flex items-center justify-between gap-4 border-b border-border text-foreground">
          <div className="flex items-center gap-2.5">
            <Music className="size-4 text-amber-700" strokeWidth={1.5} />
            <span className="purchase-banner-title font-semibold text-foreground">
              Peña Folklórica Austral
            </span>
          </div>
          <span className="rounded-sm border border-amber-600/40 bg-amber-500/15 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-800">
            Pilar · 2026
          </span>
        </div>

        <div className="purchase-content">
          {/* Tier header (shown when no pack available, original style) */}
          {!packTier && (
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-700">
                  Entradas
                </p>
                <h3 className="mt-1 font-serif text-2xl font-bold uppercase tracking-wider text-foreground sm:text-3xl">
                  {tier.name}
                </h3>
                <p className="mt-2 text-xs font-normal text-muted-foreground">
                  {soldOut
                    ? "Agotada"
                    : `Disponibles (${stageName}${deadlineLabel ? ` · ${deadlineLabel.toLowerCase()}` : ""}) · habilitación para compra de alcohol permitida únicamente a mayores de 18`}
                </p>
              </div>
              <div className="font-serif text-4xl font-bold text-foreground sm:text-5xl tracking-tight">
                {formatPrice(tier.price)}
              </div>
            </div>
          )}

          {/* Perforated ticket divider with cutouts */}
          <div aria-hidden className="purchase-perforation relative">
            <div className="absolute top-1/2 -left-10 size-6 -translate-y-1/2 rounded-full bg-background ring-1 ring-border" />
            <div className="absolute top-1/2 -right-10 size-6 -translate-y-1/2 rounded-full bg-background ring-1 ring-border" />
            <div className="border-t border-dashed border-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <h4 className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                Datos del comprador
              </h4>

              <div role="radiogroup" aria-label="Tipo de compra" className="participation-options grid gap-3 sm:grid-cols-2">
                {PARTICIPATION_OPTIONS.map((option) => {
                  const active = participation === option.value;
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "relative flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all has-[:focus-visible]:border-amber-600 has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-amber-600/40",
                        active
                          ? "border-amber-600 bg-amber-500/15 text-foreground"
                          : "border-border bg-[#F0E6D0] text-muted-foreground hover:border-amber-600/40"
                      )}
                    >
                      <input
                        type="radio"
                        name="participation"
                        value={option.value}
                        checked={active}
                        onChange={() => handleParticipationChange(option.value)}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
                          active ? "border-amber-700 bg-amber-700" : "border-border bg-[#B7A182]"
                        )}
                      />
                      <span className="grid gap-0.5">
                        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
                          <Icon className="size-3.5 text-amber-700" strokeWidth={1.5} />
                          {option.title}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">{option.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Tier selector — segmented control, visually distinct from participation cards */}
              {attending && packTier && (
                <div
                  role="radiogroup"
                  aria-label="Tipo de entrada"
                  className="tier-options grid grid-cols-2 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden border border-border"
                >
                  {/* Individual */}
                  <label className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="tier"
                      value={individualTier?.id}
                      checked={selectedTierId === individualTier?.id}
                      onChange={() => handleTierChange(individualTier?.id ?? "")}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "flex h-full flex-col items-center justify-center gap-0.5 px-3 py-3 text-center transition-colors",
                        selectedTierId === individualTier?.id
                          ? "bg-[#8A5A26] text-[#FDF7EA]"
                          : "text-foreground/70 hover:bg-[#DDD0BC]"
                      )}
                    >
                      <span className="tier-name flex items-center gap-1.5 font-semibold">
                        <TicketIcon className="size-3 shrink-0" strokeWidth={2} />
                        {individualTier?.name}
                      </span>
                      <span className="tier-price font-semibold leading-none">
                        {formatPrice(individualTier?.price ?? 0)}
                      </span>
                      <span className="tier-detail font-normal">por entrada</span>
                    </span>
                  </label>

                  {/* Divider */}
                  <div className="col-span-full hidden" aria-hidden />

                  {/* Pack Familiar */}
                  <label className="relative cursor-pointer border-l border-border">
                    <input
                      type="radio"
                      name="tier"
                      value={packTier.id}
                      checked={selectedTierId === packTier.id}
                      onChange={() => handleTierChange(packTier.id)}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "flex h-full flex-col items-center justify-center gap-0.5 px-3 py-3 text-center transition-colors",
                        selectedTierId === packTier.id
                          ? "bg-[#8A5A26] text-[#FDF7EA]"
                          : "text-foreground/70 hover:bg-[#DDD0BC]"
                      )}
                    >
                      {/* Savings badge — in-flow, centered */}
                      <span className="tier-detail mb-1 inline-flex items-center gap-1 rounded-full bg-amber-600 px-2 py-0.5 font-semibold text-white shadow-sm">
                        <Sparkles className="size-2.5 shrink-0" strokeWidth={2} />
                        Ahorrás {formatPrice(individualTier?.price ?? 0)}
                      </span>
                      <span className="tier-name flex items-center gap-1.5 font-semibold">
                        <Users className="size-3 shrink-0" strokeWidth={2} />
                        Pack Familiar
                      </span>
                      <span className="tier-price font-semibold leading-none">
                        {formatPrice(packTier.price)}
                      </span>
                      <span className="tier-detail font-normal">
                        {packTier.ticketCount} entradas individuales
                      </span>
                    </span>
                  </label>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="buyerName" className="text-xs uppercase font-medium tracking-[0.15em] text-foreground/80">
                    Nombre y apellido
                  </Label>
                  <Input
                    id="buyerName"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ej: María González"
                    required
                    className="border-border bg-[#FDF9F0] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-amber-600 focus-visible:ring-amber-600/30 transition-[border-color,box-shadow,background-color,color] duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyerEmail" className="text-xs uppercase font-medium tracking-[0.15em] text-foreground/80">
                    {attending
                      ? "Email (se envían las entradas aquí)"
                      : "Email (se envía el comprobante aquí)"}
                  </Label>
                  <Input
                    id="buyerEmail"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="maria@example.com"
                    required
                    className="border-border bg-[#FDF9F0] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-amber-600 focus-visible:ring-amber-600/30 transition-[border-color,box-shadow,background-color,color] duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referringVolunteer" className="text-xs uppercase font-medium tracking-[0.15em] text-foreground/80">
                  ¿Venís de parte de alguno de nuestros voluntarios?
                  <span className="purchase-optional">Opcional</span>
                </Label>
                <Input
                  id="referringVolunteer"
                  value={referringVolunteer}
                  onChange={(e) => setReferringVolunteer(e.target.value)}
                  placeholder="Ej: Ana Mendoza"
                  className="border-border bg-[#FDF9F0] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-amber-600 focus-visible:ring-amber-600/30 transition-[border-color,box-shadow,background-color,color] duration-200"
                />
              </div>

              {/* Quantity selector — hidden for pack (fixed at 1) */}
              {!isPack && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-xs uppercase font-medium tracking-[0.15em] text-foreground/80">
                      Cantidad de entradas
                    </Label>
                    <Select
                      value={String(quantity)}
                      onValueChange={handleQuantityChange}
                    >
                      <SelectTrigger id="quantity" className="border-border bg-[#FDF9F0] text-foreground focus-visible:border-amber-600 transition-[border-color,box-shadow,background-color,color] duration-200">
                        <SelectValue placeholder="Cantidad" />
                      </SelectTrigger>
                      <SelectContent className="purchase-select border-border text-foreground shadow-2xl">
                        {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                          <SelectItem key={n} value={String(n)} className="focus:bg-amber-500/20 focus:text-amber-800">
                            {n} {n === 1 ? "entrada" : "entradas"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Pack summary pill */}
              {isPack && (
                <div className="flex items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-200 rounded-lg border border-amber-600/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-800">
                  <Users className="size-3.5 shrink-0 text-amber-700" strokeWidth={1.5} />
                  <span>
                    El pack incluye <strong>{tier.ticketCount} entradas</strong> individuales con precio promocional.
                  </span>
                </div>
              )}
            </div>

            {/* Guest Details: Attendee vs Donation */}
            {attending ? (
              <div className="animate-in fade-in-0 duration-200 space-y-4">
                <h4 className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                  Datos de cada asistente
                </h4>
                <p className="text-xs font-normal text-muted-foreground">
                  Completá los datos de cada persona. La compra de bebidas con alcohol en barra está permitida únicamente a mayores de 18 años (hasta {DEFAULT_ALCOHOL_ALLOWANCE} consumiciones).
                </p>
                {guests.map((guest, i) => (
                  <div
                    key={i}
                    className="guest-card animate-in fade-in-0 slide-in-from-bottom-2 duration-200 border border-border"
                  >
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
                      <UserRound className="h-3.5 w-3.5 text-amber-700" strokeWidth={1.5} />
                      Asistente {i + 1}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor={`guest-name-${i}`} className="text-xs uppercase font-medium tracking-[0.1em] text-muted-foreground">
                          Nombre completo
                        </Label>
                        <Input
                          id={`guest-name-${i}`}
                          value={guest.name}
                          onChange={(e) => updateGuest(i, "name", e.target.value)}
                          placeholder="Ej: Juan Pérez"
                          required
                          className="border-border bg-[#FDF9F0] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-amber-600 focus-visible:ring-amber-600/30 transition-[border-color,box-shadow,background-color,color] duration-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`guest-dni-${i}`} className="text-xs uppercase font-medium tracking-[0.1em] text-muted-foreground">
                          DNI
                        </Label>
                        <Input
                          id={`guest-dni-${i}`}
                          inputMode="numeric"
                          value={guest.dni}
                          onChange={(e) =>
                            updateGuest(i, "dni", e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="Ej: 40123456"
                          required
                          className="border-border bg-[#FDF9F0] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-amber-600 focus-visible:ring-amber-600/30 transition-[border-color,box-shadow,background-color,color] duration-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`guest-birth-${i}`} className="text-xs uppercase font-medium tracking-[0.1em] text-muted-foreground">
                          Fecha de nacimiento
                        </Label>
                        <Input
                          id={`guest-birth-${i}`}
                          type="date"
                          value={guest.birthDate}
                          onChange={(e) =>
                            updateGuest(i, "birthDate", e.target.value)
                          }
                          max={todayStr}
                          required
                          className="border-border bg-[#FDF9F0] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-amber-600 focus-visible:ring-amber-600/30 transition-[border-color,box-shadow,background-color,color] duration-200"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor={`guest-diet-${i}`} className="text-xs uppercase font-medium tracking-[0.1em] text-muted-foreground">
                          Menú
                        </Label>
                        <Select
                          value={guest.diet}
                          onValueChange={(value) =>
                            updateGuest(i, "diet", value ?? "regular")
                          }
                        >
                          <SelectTrigger id={`guest-diet-${i}`} className="border-border bg-[#FDF9F0] text-foreground focus-visible:border-amber-600 transition-[border-color,box-shadow,background-color,color] duration-200">
                            <SelectValue placeholder="Seleccioná el menú">
                              {dietLabel(guest.diet)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="purchase-select border-border text-foreground shadow-2xl">
                            {DIET_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="focus:bg-amber-500/20 focus:text-amber-800"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-start gap-3 animate-in fade-in-0 zoom-in-95 duration-200 rounded-lg border border-dashed border-amber-600/40 bg-amber-500/15 p-4 text-sm text-amber-800">
                <Heart className="mt-0.5 size-4 shrink-0 text-amber-700" strokeWidth={1.5} />
                <div>
                  <p className="font-semibold uppercase tracking-wider text-xs text-amber-800">Donación registrada</p>
                  <p className="mt-1 text-xs font-normal text-amber-800/90">
                    Las <strong>{totalTickets}</strong> entradas van a disposición de la
                    organización para entregarse. No hace falta cargar datos de asistentes
                    y no se generan códigos QR.
                  </p>
                </div>
              </div>
            )}

            {/* Total summary bar */}
            <div className="purchase-total flex items-center justify-between gap-3">
              <div className="grid gap-0.5">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/80">
                  {isPack
                    ? `Pack Familiar`
                    : `${effectiveQty} ${effectiveQty === 1 ? "entrada" : "entradas"}`}
                </span>
                {isPack && (
                  <span className="text-[10px] text-muted-foreground line-through">
                    {formatPrice((individualTier?.price ?? 0) * totalTickets)}
                  </span>
                )}
              </div>
              <div key={total} className="font-serif text-2xl font-bold text-amber-800 tracking-wide animate-in fade-in duration-150">
                {formatPrice(total)}
              </div>
            </div>

            {/* Primary Action Button */}
            <Button
              type="submit"
              size="lg"
              className="purchase-submit w-full cursor-pointer disabled:opacity-50"
              disabled={loading || soldOut}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />{" "}
                  Preparando pago…
                </>
              ) : (
                `Pagar ${formatPrice(total)}`
              )}
            </Button>
            <p className="text-center text-xs font-normal uppercase tracking-[0.2em] text-muted-foreground/75">
              {attending
                ? "Al completar el pago recibís tu código QR por email."
                : "Al completar el pago recibís tu comprobante de donación por email."}
            </p>
            <p className="text-center text-xs font-normal uppercase tracking-[0.2em] text-muted-foreground/50">
              La venta y consumo de bebidas alcohólicas está permitida únicamente a mayores de 18 años.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

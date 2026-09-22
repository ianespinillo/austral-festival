"use client";

import { useState } from "react";
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
import { DIET_OPTIONS } from "@/lib/diet";
import { DEFAULT_ALCOHOL_ALLOWANCE, PREVENTA_LABEL } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Music,
  UserRound,
  CheckCircle2,
  Gift,
  Heart,
} from "lucide-react";

interface TierOption {
  id: string;
  name: string;
  price: number;
  remaining: number;
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
    desc: "Las entradas quedan para que la organización las entregue",
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

export function PurchaseForm({ tiers }: { tiers: TierOption[] }) {
  const router = useRouter();
  const tier = tiers[0];
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [participation, setParticipation] = useState<Participation>("asistir");
  const [referringVolunteer, setReferringVolunteer] = useState("");
  const [guests, setGuests] = useState<GuestInput[]>([makeEmptyGuest()]);
  const [loading, setLoading] = useState(false);

  const soldOut = !tier || tier.remaining === 0;
  const total = (tier?.price ?? 0) * quantity;
  const attending = participation === "asistir";

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
    setLoading(true);
    try {
      const result = await createCheckoutPreference({
        tierId: tier.id,
        quantity,
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

  if (!tier) {
    return (
      <div className="mx-auto mt-10 max-w-3xl border border-white/15 bg-[#12040f] p-8 text-center text-xs uppercase tracking-[0.2em] text-white/60">
        No hay entradas a la venta por ahora.
      </div>
    );
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <div className="overflow-hidden border border-white/15 bg-[#12040f] shadow-2xl">
        {/* Ticket Top Banner */}
        <div className="flex items-center justify-between gap-4 border-b border-white/15 bg-[#1a0617] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Music className="size-4 text-white" strokeWidth={1.5} />
            <span className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-white">
              Peña Folklórica Austral
            </span>
          </div>
          <span className="border border-white/25 bg-white/5 px-3 py-1 font-sans text-[10px] font-light uppercase tracking-[0.25em] text-white">
            Pilar · 2026
          </span>
        </div>

        <div className="px-6 py-8 sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-light uppercase tracking-[0.3em] text-white/50">
                Entradas
              </p>
              <h3 className="mt-1 font-serif text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
                {tier.name}
              </h3>
              <p className="mt-2 text-xs font-light text-white/60">
                {soldOut
                  ? "Agotada"
                  : `Disponibles (${PREVENTA_LABEL}) · cada entrada incluye ${DEFAULT_ALCOHOL_ALLOWANCE} bebidas alcohólicas`}
              </p>
            </div>
            <div className="font-serif text-4xl font-bold text-white sm:text-5xl tracking-tight">
              {formatPrice(tier.price)}
            </div>
          </div>

          {/* Perforated ticket divider with cutouts */}
          <div aria-hidden className="relative my-8">
            <div className="absolute top-1/2 -left-10 size-6 -translate-y-1/2 rounded-full bg-[#080407] ring-1 ring-white/15" />
            <div className="absolute top-1/2 -right-10 size-6 -translate-y-1/2 rounded-full bg-[#080407] ring-1 ring-white/15" />
            <div className="border-t border-dashed border-white/20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <h4 className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                Datos del comprador
              </h4>

              <div role="radiogroup" aria-label="Tipo de compra" className="grid gap-3 sm:grid-cols-2">
                {PARTICIPATION_OPTIONS.map((option) => {
                  const active = participation === option.value;
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "relative flex cursor-pointer items-start gap-3 border p-4 transition-all has-[:focus-visible]:border-white has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-white/40",
                        active
                          ? "border-white bg-[#1e0719] text-white"
                          : "border-white/15 bg-[#0d030b] text-white/70 hover:border-white/30"
                      )}
                    >
                      <input
                        type="radio"
                        name="participation"
                        value={option.value}
                        checked={active}
                        onChange={() => setParticipation(option.value)}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          "mt-0.5 grid size-4 shrink-0 place-items-center border transition-colors",
                          active ? "border-white bg-white" : "border-white/40 bg-transparent"
                        )}
                      >
                        {active && <CheckCircle2 className="size-3 text-[#080407]" />}
                      </span>
                      <span className="grid gap-0.5">
                        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white">
                          <Icon className="size-3.5 text-white" strokeWidth={1.5} />
                          {option.title}
                        </span>
                        <span className="text-[11px] font-light text-white/60">{option.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="buyerName" className="text-xs uppercase font-light tracking-[0.15em] text-white/80">
                    Nombre y apellido
                  </Label>
                  <Input
                    id="buyerName"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ej: María González"
                    required
                    className="border-white/20 bg-black/40 text-white placeholder:text-white/30 focus-visible:border-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyerEmail" className="text-xs uppercase font-light tracking-[0.15em] text-white/80">
                    Email (se envían todas las entradas aquí)
                  </Label>
                  <Input
                    id="buyerEmail"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="maria@example.com"
                    required
                    className="border-white/20 bg-black/40 text-white placeholder:text-white/30 focus-visible:border-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referringVolunteer" className="text-xs uppercase font-light tracking-[0.15em] text-white/80">
                  ¿Venís de parte de alguno de nuestros voluntarios?
                </Label>
                <Input
                  id="referringVolunteer"
                  value={referringVolunteer}
                  onChange={(e) => setReferringVolunteer(e.target.value)}
                  placeholder="Ej: Ana Mendoza"
                  className="border-white/20 bg-black/40 text-white placeholder:text-white/30 focus-visible:border-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-xs uppercase font-light tracking-[0.15em] text-white/80">
                    Cantidad de entradas
                  </Label>
                  <Select
                    value={String(quantity)}
                    onValueChange={handleQuantityChange}
                  >
                    <SelectTrigger id="quantity" className="border-white/20 bg-black/40 text-white focus-visible:border-white">
                      <SelectValue placeholder="Cantidad" />
                    </SelectTrigger>
                    <SelectContent className="border-white/20 bg-[#150512] text-white">
                      {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)} className="focus:bg-white/10 focus:text-white">
                          {n} {n === 1 ? "entrada" : "entradas"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {attending ? (
              <div className="space-y-4">
                <h4 className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                  Datos de cada asistente
                </h4>
                <p className="text-[11px] font-light text-white/60">
                  Completá los datos de cada persona. Los menores de 18 años no tendrán acceso a
                  bebidas alcohólicas.
                </p>
                {guests.map((guest, i) => (
                  <div
                    key={i}
                    className="border border-white/15 bg-[#160513] p-4"
                  >
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white">
                      <UserRound className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
                      Asistente {i + 1}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor={`guest-name-${i}`} className="text-[11px] uppercase font-light tracking-[0.1em] text-white/70">
                          Nombre completo
                        </Label>
                        <Input
                          id={`guest-name-${i}`}
                          value={guest.name}
                          onChange={(e) => updateGuest(i, "name", e.target.value)}
                          placeholder="Ej: Juan Pérez"
                          required
                          className="border-white/20 bg-black/40 text-white placeholder:text-white/30 focus-visible:border-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`guest-dni-${i}`} className="text-[11px] uppercase font-light tracking-[0.1em] text-white/70">
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
                          className="border-white/20 bg-black/40 text-white placeholder:text-white/30 focus-visible:border-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`guest-birth-${i}`} className="text-[11px] uppercase font-light tracking-[0.1em] text-white/70">
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
                          className="border-white/20 bg-black/40 text-white placeholder:text-white/30 focus-visible:border-white"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor={`guest-diet-${i}`} className="text-[11px] uppercase font-light tracking-[0.1em] text-white/70">
                          Menú
                        </Label>
                        <Select
                          value={guest.diet}
                          onValueChange={(value) =>
                            updateGuest(i, "diet", value ?? "regular")
                          }
                        >
                          <SelectTrigger id={`guest-diet-${i}`} className="border-white/20 bg-black/40 text-white focus-visible:border-white">
                            <SelectValue placeholder="Seleccioná el menú" />
                          </SelectTrigger>
                          <SelectContent className="border-white/20 bg-[#150512] text-white">
                            {DIET_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="focus:bg-white/10 focus:text-white"
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
              <div className="flex items-start gap-3 border border-dashed border-white/25 bg-white/5 p-4 text-sm text-white">
                <Heart className="mt-0.5 size-4 shrink-0 text-white" strokeWidth={1.5} />
                <div>
                  <p className="font-semibold uppercase tracking-wider text-xs">Donación registrada</p>
                  <p className="mt-1 text-xs font-light text-white/70">
                    Las <strong>{quantity}</strong> entradas quedan a disposición de la
                    organización para entregarse. No hace falta cargar datos de asistentes.
                  </p>
                </div>
              </div>
            )}

            {/* Total summary bar */}
            <div className="flex items-center justify-between border border-white/15 bg-[#1b0618] px-5 py-4">
              <div className="text-xs font-light uppercase tracking-[0.2em] text-white/80">
                {quantity} {quantity === 1 ? "entrada" : "entradas"} ·{" "}
                {attending ? "asistencia" : "donación"}
              </div>
              <div className="font-serif text-2xl font-bold text-white tracking-wide">
                {formatPrice(total)}
              </div>
            </div>

            {/* Primary Action Button */}
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full bg-white font-medium text-xs uppercase tracking-[0.25em] text-[#080407] transition-all hover:bg-white/90 disabled:opacity-50"
              disabled={loading || soldOut}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin text-[#080407]" />{" "}
                  Preparando pago…
                </>
              ) : (
                `Pagar ${formatPrice(total)} con Mercado Pago`
              )}
            </Button>
            <p className="text-center text-[11px] font-light uppercase tracking-[0.2em] text-white/50">
              Al completar el pago recibís tu código QR por email.
            </p>
            <p className="text-center text-[11px] font-light uppercase tracking-[0.2em] text-white/40">
              No está permitida la venta de bebidas alcohólicas a menores de edad.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
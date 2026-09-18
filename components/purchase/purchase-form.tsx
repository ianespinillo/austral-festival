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
      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-border bg-card p-8 text-center text-muted-foreground">
        No hay entradas a la venta por ahora.
      </div>
    );
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-4 bg-vino px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Music className="size-5" />
            <span className="font-display text-sm font-bold uppercase tracking-wide">
              Peña Folklórica Austral
            </span>
          </div>
          <span className="rounded-full bg-oro px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-accent-foreground">
            Pilar · 2026
          </span>
        </div>

        <div className="px-6 py-7 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Entradas
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
                {tier.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {soldOut
                  ? "Agotada"
                  : `Disponibles (${PREVENTA_LABEL}) · cada entrada incluye ${DEFAULT_ALCOHOL_ALLOWANCE} bebidas alcohólicas`}
              </p>
            </div>
            <div className="font-display text-4xl font-bold text-primary sm:text-5xl">
              {formatPrice(tier.price)}
            </div>
          </div>

          <div aria-hidden className="relative mt-8 mb-7">
            <div className="absolute top-1/2 -left-6 size-6 -translate-y-1/2 rounded-full bg-background ring-1 ring-border" />
            <div className="absolute top-1/2 -right-6 size-6 -translate-y-1/2 rounded-full bg-background ring-1 ring-border" />
            <div className="border-t-2 border-dashed border-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
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
                        "relative flex cursor-pointer items-start gap-3 rounded-2xl border-2 bg-card p-4 transition-all has-[:focus-visible]:border-ring has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/40",
                        active
                          ? "border-primary shadow-sm ring-1 ring-primary/20"
                          : "border-border hover:border-primary/40"
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
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                          active ? "border-primary bg-primary" : "border-muted-foreground/40"
                        )}
                      >
                        {active && <CheckCircle2 className="size-3 text-primary-foreground" />}
                      </span>
                      <span className="grid gap-0.5">
                        <span className="flex items-center gap-2 text-sm font-bold">
                          <Icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground")} />
                          {option.title}
                        </span>
                        <span className="text-xs text-muted-foreground">{option.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="buyerName">Nombre y apellido</Label>
                  <Input
                    id="buyerName"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ej: María González"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyerEmail">Email (se envían todas las entradas aquí)</Label>
                  <Input
                    id="buyerEmail"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="maria@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referringVolunteer">
                  ¿Venís de parte de alguno de nuestros voluntarios?
                </Label>
                <Input
                  id="referringVolunteer"
                  value={referringVolunteer}
                  onChange={(e) => setReferringVolunteer(e.target.value)}
                  placeholder="Ej: Ana Mendoza"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad de entradas</Label>
                  <Select
                    value={String(quantity)}
                    onValueChange={handleQuantityChange}
                  >
                    <SelectTrigger id="quantity">
                      <SelectValue placeholder="Cantidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>
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
                <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  Datos de cada asistente
                </h4>
                <p className="text-xs text-muted-foreground">
                  Completá los datos de cada persona. Los menores de 18 años no tendrán acceso a
                  bebidas alcohólicas.
                </p>
                {guests.map((guest, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-secondary/30 p-4"
                  >
                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <UserRound className="h-4 w-4" />
                      Asistente {i + 1}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor={`guest-name-${i}`}>Nombre completo</Label>
                        <Input
                          id={`guest-name-${i}`}
                          value={guest.name}
                          onChange={(e) => updateGuest(i, "name", e.target.value)}
                          placeholder="Ej: Juan Pérez"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`guest-dni-${i}`}>DNI</Label>
                        <Input
                          id={`guest-dni-${i}`}
                          inputMode="numeric"
                          value={guest.dni}
                          onChange={(e) =>
                            updateGuest(i, "dni", e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="Ej: 40123456"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`guest-birth-${i}`}>
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
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor={`guest-diet-${i}`}>Menú</Label>
                        <Select
                          value={guest.diet}
                          onValueChange={(value) =>
                            updateGuest(i, "diet", value ?? "regular")
                          }
                        >
                          <SelectTrigger id={`guest-diet-${i}`}>
                            <SelectValue placeholder="Seleccioná el menú" />
                          </SelectTrigger>
                          <SelectContent>
                            {DIET_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
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
              <div className="flex items-start gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm">
                <Heart className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">Donación registrada</p>
                  <p className="mt-0.5 text-muted-foreground">
                    Las <strong>{quantity}</strong> entradas quedan a disposición de la
                    organización para entregarse. No hace falta cargar datos de asistentes.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-2xl bg-secondary/60 px-5 py-4">
              <div className="text-sm font-semibold">
                {quantity} {quantity === 1 ? "entrada" : "entradas"} ·{" "}
                {attending ? "asistencia" : "donación"}
              </div>
              <div className="font-display text-2xl font-bold text-foreground">
                {formatPrice(total)}
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary text-base font-bold hover:bg-primary/90"
              disabled={loading || soldOut}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />{" "}
                  Preparando pago…
                </>
              ) : (
                `Pagar ${formatPrice(total)} con Mercado Pago`
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Al completar el pago recibís tu código QR por email.
            </p>
            <p className="text-center text-xs text-muted-foreground">
              No está permitida la venta de bebidas alcohólicas a menores de edad.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
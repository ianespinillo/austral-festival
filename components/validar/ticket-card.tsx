"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  checkInTicket,
  serveDrink,
  undoDrink,
} from "@/app/actions";
import { TicketData } from "./ticket-data";
import { dietLabel } from "@/lib/diet";
import {
  CheckCircle2,
  UserCheck,
  Wine,
  GlassWater,
  Undo2,
  Loader2,
  CalendarDays,
  MapPin,
  CalendarClock,
  ShieldCheck,
  ShieldAlert,
  UtensilsCrossed,
} from "lucide-react";

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function TicketCard({
  ticket,
  onUpdated,
  onNotFound,
}: {
  ticket: TicketData;
  onUpdated: (updated: TicketData) => void;
  onNotFound: () => void;
  }) {
  const [busy, setBusy] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setBusy("checkin");
    try {
      const result = await checkInTicket(ticket.id);
      if (!result.ok) {
        toast.error(result.error ?? "No se pudo validar el ingreso.");
        return;
      }
      toast.success("Ingreso validado. ¡Que disfrute!");
      onUpdated({ ...ticket, status: "used", checkedInAt: new Date() });
    } finally {
      setBusy(null);
    }
  };

  const handleServe = async (drinkType: "alcoholic" | "non_alcoholic") => {
    setBusy(drinkType);
    try {
      const result = await serveDrink(ticket.id, drinkType);
      if (!result.ok) {
        toast.error(result.error ?? "No se pudo registrar la bebida.");
        if (result.error?.includes("no encontrada")) onNotFound();
        return;
      }
      toast.success(
        drinkType === "alcoholic"
          ? "Bebida alcohólica servida."
          : "Bebida sin alcohol servida."
      );
      const data = result.data as {
        redemptionId: string;
        alcoholicServed: number;
        maxAlcoholic: number;
      };
      const newRedemption = {
        id: data.redemptionId,
        drinkType,
        servedAt: new Date(),
      };
      const alcoholicServed =
        drinkType === "alcoholic"
          ? data.alcoholicServed
          : ticket.alcoholicServed;
      onUpdated({
        ...ticket,
        alcoholicServed,
        alcoholicRemaining: Math.max(0, data.maxAlcoholic - alcoholicServed),
        nonAlcoholicServed:
          ticket.nonAlcoholicServed +
          (drinkType === "non_alcoholic" ? 1 : 0),
        drinkRedemptions: [newRedemption, ...ticket.drinkRedemptions],
      });
    } finally {
      setBusy(null);
    }
  };

  const handleUndo = async (redemptionId: string) => {
    setBusy("undo");
    try {
      const result = await undoDrink(redemptionId);
      if (!result.ok) {
        toast.error(result.error ?? "No se pudo deshacer el registro.");
        return;
      }
      const newRedemptions = ticket.drinkRedemptions.filter(
        (r) => r.id !== redemptionId
      );
      const alcoholics = newRedemptions.filter(
        (r) => r.drinkType === "alcoholic"
      ).length;
      const nonAlcoholics = newRedemptions.filter(
        (r) => r.drinkType === "non_alcoholic"
      ).length;
      toast.success("Registro deshecho.");
      onUpdated({
        ...ticket,
        drinkRedemptions: newRedemptions,
        alcoholicServed: alcoholics,
        alcoholicRemaining: Math.max(0, ticket.maxAlcoholic - alcoholics),
        nonAlcoholicServed: nonAlcoholics,
      });
    } finally {
      setBusy(null);
    }
  };

  const checkedIn = ticket.status === "used";
  const limitReached = ticket.alcoholicRemaining === 0;
  const minor = ticket.alcoholAllowance === 0;

  return (
    <Card className="border border-white/15 bg-[#12040f] text-white shadow-xl">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-[11px] font-light uppercase tracking-[0.25em] text-white/50">
              {ticket.eventName}
            </p>
            <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-white">
              {ticket.tierName}
            </h3>
          </div>
          {checkedIn ? (
            <Badge variant="outline" className="border-white/40 bg-white/10 text-white font-light text-[10px] uppercase tracking-[0.2em]">
              <CheckCircle2 className="mr-1.5 size-3 text-white" strokeWidth={1.5} /> Ingresó{" "}
              {ticket.checkedInAt ? formatDate(ticket.checkedInAt) : ""}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-white/20 text-white/70 font-light text-[10px] uppercase tracking-[0.2em]">
              Por ingresar
            </Badge>
          )}
        </div>

        {/* Datos físicos / de identificación del asistente */}
        <div className="border border-white/15 bg-[#1a0617] p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="grid gap-1.5 text-xs">
              <p className="font-serif text-base font-bold uppercase tracking-wide text-white">
                {ticket.holderName}
              </p>
              <p className="text-white/80">
                <span className="font-light text-white/50 uppercase tracking-[0.1em]">DNI: </span>
                <span className="font-mono font-medium text-white">{ticket.holderDni}</span>
              </p>
              {ticket.holderBirthDate && (
                <p className="flex items-center gap-1.5 text-[11px] font-light text-white/60">
                  <CalendarClock className="size-3.5 text-white/70" strokeWidth={1.5} />
                  Nacimiento:{" "}
                  {new Date(ticket.holderBirthDate).toLocaleDateString("es-AR")}
                  {ticket.holderAge !== null && ` · ${ticket.holderAge} años`}
                </p>
              )}
              {ticket.diet !== "regular" && (
                <p className="flex items-center gap-1.5 text-[11px] font-light text-white">
                  <UtensilsCrossed className="size-3.5 text-white/70" strokeWidth={1.5} />
                  Menú: {dietLabel(ticket.diet)}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              {minor ? (
                <Badge
                  variant="outline"
                  className="border-red-400/50 bg-red-950/30 text-red-300 text-[10px] font-light uppercase tracking-[0.15em]"
                >
                  <ShieldAlert className="mr-1 size-3" />
                  Menor de edad
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-white/30 bg-white/5 text-white text-[10px] font-light uppercase tracking-[0.15em]"
                >
                  <ShieldCheck className="mr-1 size-3 text-white" strokeWidth={1.5} />
                  Mayor de edad
                </Badge>
              )}
              <p className="text-[10px] font-light text-white/50 uppercase tracking-[0.1em]">
                {ticket.alcoholAllowance > 0
                  ? `${ticket.alcoholAllowance} consumos incluidos`
                  : "Sin bebidas alcohólicas"}
              </p>
            </div>
          </div>
          <p className="mt-3 border-t border-white/10 pt-2 font-mono text-[11px] text-white/40">
            {ticket.qrCode}
          </p>
        </div>

        <div className="grid gap-1 text-xs font-light text-white/60">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-white" strokeWidth={1.5} />
            {formatDate(ticket.eventDate)}
            <MapPin className="ml-2 size-3.5 text-white" strokeWidth={1.5} />
            {ticket.eventVenue}
          </p>
        </div>

        <Separator className="bg-white/10" />

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-serif uppercase tracking-wider text-white">
              <Wine className="size-3.5 text-white" strokeWidth={1.5} />
              Consumos (alcohólicos)
            </span>
            <span
              className={limitReached ? "font-semibold text-red-400" : "font-mono font-medium text-white"}
            >
              {ticket.alcoholicServed}/{ticket.maxAlcoholic}
            </span>
          </div>
          {ticket.maxAlcoholic > 0 ? (
            <>
              <Progress
                value={(ticket.alcoholicServed / ticket.maxAlcoholic) * 100}
                className="h-1.5 bg-white/10 [&>div]:bg-white"
              />
              <p className="text-[11px] font-light text-white/50">
                {limitReached
                  ? `Límite alcanzado (${ticket.maxAlcoholic} consumos).`
                  : `Quedan ${ticket.alcoholicRemaining} consumos.`}
                {ticket.nonAlcoholicServed > 0 &&
                  ` · ${ticket.nonAlcoholicServed} sin alcohol servidas.`}
              </p>
            </>
          ) : (
            <p className="text-xs font-light text-red-400">
              Este asistente es menor de edad. No puede consumir bebidas alcohólicas.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          {!checkedIn && (
            <Button
              variant="default"
              onClick={handleCheckIn}
              disabled={busy !== null}
              className="h-10 bg-white text-[#080407] hover:bg-white/90 text-xs font-semibold uppercase tracking-[0.2em] sm:flex-1"
            >
              {busy === "checkin" ? (
                <Loader2 className="mr-2 size-3.5 animate-spin text-[#080407]" />
              ) : (
                <UserCheck className="mr-2 size-3.5 text-[#080407]" strokeWidth={1.5} />
              )}
              Validar ingreso
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => handleServe("alcoholic")}
            disabled={busy !== null || limitReached || !checkedIn}
            className="h-10 border-white/20 text-white hover:bg-white/10 text-xs font-light uppercase tracking-[0.15em] sm:flex-1"
          >
            <Wine className="mr-2 size-3.5 text-white" strokeWidth={1.5} />
            Servir alcohólica
          </Button>
          <Button
            variant="outline"
            onClick={() => handleServe("non_alcoholic")}
            disabled={busy !== null || !checkedIn}
            className="h-10 border-white/20 text-white hover:bg-white/10 text-xs font-light uppercase tracking-[0.15em] sm:flex-1"
          >
            <GlassWater className="mr-2 size-3.5 text-white" strokeWidth={1.5} />
            Servir sin alcohol
          </Button>
        </div>

        {ticket.drinkRedemptions.length > 0 && (
          <div className="border border-white/10 bg-[#160513] p-4 text-xs">
            <p className="text-[11px] font-light uppercase tracking-[0.2em] text-white/50">
              Últimos consumos
            </p>
            <div className="mt-3 space-y-2">
              {ticket.drinkRedemptions.slice(0, 5).map((redemption) => (
                <div
                  key={redemption.id}
                  className="flex items-center justify-between text-xs text-white/80"
                >
                  <span className="flex items-center gap-2">
                    {redemption.drinkType === "alcoholic" ? (
                      <Wine className="size-3 text-white" strokeWidth={1.5} />
                    ) : (
                      <GlassWater className="size-3 text-white" strokeWidth={1.5} />
                    )}
                    {redemption.drinkType === "alcoholic"
                      ? "Alcohólica"
                      : "Sin alcohol"}{" "}
                    · {formatDate(redemption.servedAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] font-light uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/10"
                    disabled={busy !== null}
                    onClick={() => handleUndo(redemption.id)}
                  >
                    <Undo2 className="mr-1 size-3 text-white" /> Deshacer
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

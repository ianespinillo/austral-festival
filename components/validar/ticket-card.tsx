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
    <Card className={checkedIn ? "border-emerald-600/40" : ""}>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {ticket.eventName}
            </p>
            <h3 className="text-lg font-semibold tracking-tight">
              {ticket.tierName}
            </h3>
          </div>
          {checkedIn ? (
            <Badge variant="default" className="bg-emerald-600">
              <CheckCircle2 className="mr-1 h-3 w-3" /> Ingresó{" "}
              {ticket.checkedInAt ? formatDate(ticket.checkedInAt) : ""}
            </Badge>
          ) : (
            <Badge variant="secondary">Por ingresar</Badge>
          )}
        </div>

        {/* Datos físicos / de identificación del asistente */}
        <div
          className={`rounded-xl border p-4 ${
            minor
              ? "border-amber-400/60 bg-amber-50/60 dark:bg-amber-950/20"
              : "border-border bg-secondary/40"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="grid gap-1 text-sm">
              <p className="text-base font-semibold">{ticket.holderName}</p>
              <p>
                <span className="text-muted-foreground">DNI: </span>
                <span className="font-mono font-medium">{ticket.holderDni}</span>
              </p>
              {ticket.holderBirthDate && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Nacimiento:{" "}
                  {new Date(ticket.holderBirthDate).toLocaleDateString("es-AR")}
                  {ticket.holderAge !== null && ` · ${ticket.holderAge} años`}
                </p>
              )}
              {ticket.diet !== "regular" && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                  Menú: {dietLabel(ticket.diet)}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              {minor ? (
                <Badge
                  variant="outline"
                  className="border-amber-500 text-amber-600"
                >
                  <ShieldAlert className="mr-1 h-3 w-3" />
                  Menor de edad
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-emerald-500 text-emerald-600"
                >
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Mayor de edad
                </Badge>
              )}
              <p className="text-xs text-muted-foreground">
                {ticket.alcoholAllowance > 0
                  ? `${ticket.alcoholAllowance} consumos (bebidas alcohólicas)`
                  : "Menor de edad · sin consumos"}
              </p>
            </div>
          </div>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {ticket.qrCode}
          </p>
        </div>

        <div className="grid gap-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(ticket.eventDate)}
            <MapPin className="ml-2 h-3.5 w-3.5" />
            {ticket.eventVenue}
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Wine className="h-4 w-4" />
              Consumos (alcohólicos)
            </span>
            <span
              className={limitReached ? "font-semibold text-destructive" : ""}
            >
              {ticket.alcoholicServed}/{ticket.maxAlcoholic}
            </span>
          </div>
          {ticket.maxAlcoholic > 0 ? (
            <>
              <Progress
                value={(ticket.alcoholicServed / ticket.maxAlcoholic) * 100}
                className={
                  limitReached
                    ? "bg-destructive/20 [&>div]:bg-destructive"
                    : ""
                }
              />
              <p className="text-xs text-muted-foreground">
                {limitReached
                  ? `Límite alcanzado (${ticket.maxAlcoholic} consumos).`
                  : `Quedan ${ticket.alcoholicRemaining} consumos.`}
                {ticket.nonAlcoholicServed > 0 &&
                  ` · ${ticket.nonAlcoholicServed} sin alcohol servidas.`}
              </p>
            </>
          ) : (
            <p className="text-xs text-amber-600">
              Este asistente es menor de edad. No puede consumir bebidas alcohólicas.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {!checkedIn && (
            <Button
              variant="default"
              onClick={handleCheckIn}
              disabled={busy !== null}
              className="sm:flex-1"
            >
              {busy === "checkin" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserCheck className="mr-2 h-4 w-4" />
              )}
              Validar ingreso
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => handleServe("alcoholic")}
            disabled={busy !== null || limitReached || !checkedIn}
            className={checkedIn && !limitReached ? "sm:flex-1" : ""}
          >
            <Wine className="mr-2 h-4 w-4" />
            Servir bebida alcohólica
          </Button>
          <Button
            variant="outline"
            onClick={() => handleServe("non_alcoholic")}
            disabled={busy !== null || !checkedIn}
            className="sm:flex-1"
          >
            <GlassWater className="mr-2 h-4 w-4" />
            Servir sin alcohol
          </Button>
        </div>

        {ticket.drinkRedemptions.length > 0 && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Últimos consumos
            </p>
            <div className="mt-2 space-y-1.5">
              {ticket.drinkRedemptions.slice(0, 5).map((redemption) => (
                <div
                  key={redemption.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    {redemption.drinkType === "alcoholic" ? (
                      <Wine className="h-3.5 w-3.5" />
                    ) : (
                      <GlassWater className="h-3.5 w-3.5" />
                    )}
                    {redemption.drinkType === "alcoholic"
                      ? "Alcohólica"
                      : "Sin alcohol"}{" "}
                    · {formatDate(redemption.servedAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    disabled={busy !== null}
                    onClick={() => handleUndo(redemption.id)}
                  >
                    <Undo2 className="mr-1 h-3 w-3" /> Deshacer
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

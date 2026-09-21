import { UtensilsCrossed, Sparkles, Leaf, Fish, Beef } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardTicket, DietSummary } from "@/lib/dashboard/types";
import { Badge } from "@/components/ui/badge";

interface CateringSummaryProps {
  dietCounts: DietSummary;
  tickets: DashboardTicket[];
}

export function CateringSummary({ dietCounts, tickets }: CateringSummaryProps) {
  const specialTickets = tickets.filter((t) => t.diet !== "regular");

  const calcPercentage = (val: number) => {
    if (dietCounts.total === 0) return 0;
    return Math.round((val / dietCounts.total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Resumen numérico en cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Celíacos */}
        <Card className="border-border/80 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Celíacos (Sin TACC)
            </CardTitle>
            <div className="grid size-9 place-items-center rounded-lg bg-oro/20 text-amber-700 dark:text-oro">
              <Sparkles className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold font-display text-amber-700 dark:text-oro">
                {dietCounts.celiaco}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {calcPercentage(dietCounts.celiaco)}% del total
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Requieren empaque individual hermético.
            </p>
          </CardContent>
        </Card>

        {/* Vegetarianos */}
        <Card className="border-border/80 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Vegetarianos
            </CardTitle>
            <div className="grid size-9 place-items-center rounded-lg bg-pampa/20 text-pampa">
              <Leaf className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold font-display text-pampa">
                {dietCounts.vegetariano}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {calcPercentage(dietCounts.vegetariano)}% del total
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Empanadas de verdura / choclo / queso.
            </p>
          </CardContent>
        </Card>

        {/* Sin carne viernes */}
        <Card className="border-border/80 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Sin Carne Viernes
            </CardTitle>
            <div className="grid size-9 place-items-center rounded-lg bg-cielo/20 text-sky-700 dark:text-cielo">
              <Fish className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold font-display text-sky-700 dark:text-cielo">
                {dietCounts.sin_carne_viernes}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {calcPercentage(dietCounts.sin_carne_viernes)}% del total
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Vigilia tradicional o preferencias de cuaresma.
            </p>
          </CardContent>
        </Card>

        {/* Regulares */}
        <Card className="border-border/80 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Menú Regular
            </CardTitle>
            <div className="grid size-9 place-items-center rounded-lg bg-muted text-foreground">
              <Beef className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold font-display text-foreground">
                {dietCounts.regular}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {calcPercentage(dietCounts.regular)}% del total
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Parrilla tradicional / empanadas criollas.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista para cocina de comensales con dietas especiales */}
      <Card className="border-border/80 bg-card shadow-sm">
        <CardHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UtensilsCrossed className="size-4 text-primary" />
              Nómina de Dietas Especiales para Cocina y Buffet ({specialTickets.length})
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Para entrega controlada por DNI / Entrada
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60 text-sm max-h-96 overflow-y-auto">
            {specialTickets.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No hay asistentes registrados con dietas especiales aún.
              </div>
            ) : (
              specialTickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20">
                  <div>
                    <div className="font-semibold text-foreground">{t.holderName}</div>
                    <div className="text-xs text-muted-foreground">
                      DNI: {t.holderDni} · Entrada: {t.qrCode}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.diet === "celiaco" && (
                      <Badge className="bg-oro text-amber-950 font-bold border-amber-400">
                        Celíaco (Sin TACC)
                      </Badge>
                    )}
                    {t.diet === "vegetariano" && (
                      <Badge className="bg-pampa text-white font-semibold">
                        Vegetariano
                      </Badge>
                    )}
                    {t.diet === "sin_carne_viernes" && (
                      <Badge className="bg-cielo text-sky-950 font-semibold">
                        Sin carne viernes
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {t.status === "used" ? (
                        <span className="text-pampa font-medium">✓ En el evento</span>
                      ) : (
                        "No ingresó aún"
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

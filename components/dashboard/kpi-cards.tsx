import { DollarSign, Users, UserCheck, Wine, GlassWater, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardKPIs } from "@/lib/dashboard/types";

interface KPICardsProps {
  kpis: DashboardKPIs;
}

export function KPICards({ kpis }: KPICardsProps) {
  const formattedRevenue = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(kpis.totalRevenue);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Recaudación */}
      <Card className="border-border/80 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Recaudación Aprobada
          </CardTitle>
          <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <DollarSign className="size-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-display text-primary tracking-tight">
            {formattedRevenue}
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="size-3 text-pampa inline" />
            <span>{kpis.totalPurchases} órdenes confirmadas</span>
          </p>
        </CardContent>
      </Card>

      {/* Capacidad y Entradas Vendidas */}
      <Card className="border-border/80 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Entradas Emitidas
          </CardTitle>
          <div className="grid size-9 place-items-center rounded-lg bg-oro/20 text-oro">
            <Users className="size-5 text-amber-700 dark:text-oro" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-foreground">
              {kpis.totalTicketsSold}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              de {kpis.totalCapacity} cupo ({kpis.capacityRate}%)
            </span>
          </div>
          <div className="mt-2">
            <Progress value={kpis.capacityRate} className="h-2 bg-muted [&>div]:bg-oro" />
          </div>
        </CardContent>
      </Card>

      {/* Asistencia en Puerta (Check-in) */}
      <Card className="border-border/80 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Asistencia en Puerta
          </CardTitle>
          <div className="grid size-9 place-items-center rounded-lg bg-pampa/15 text-pampa">
            <UserCheck className="size-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-pampa">
              {kpis.totalTicketsCheckedIn}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {kpis.attendanceRate}% de presentes
            </span>
          </div>
          <div className="mt-2">
            <Progress value={kpis.attendanceRate} className="h-2 bg-muted [&>div]:bg-pampa" />
          </div>
        </CardContent>
      </Card>

      {/* Consumición de Bebidas */}
      <Card className="border-border/80 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Bebidas Servidas
          </CardTitle>
          <div className="grid size-9 place-items-center rounded-lg bg-cielo/20 text-cielo">
            <Wine className="size-5 text-sky-700 dark:text-cielo" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-foreground">
              {kpis.drinksAlcoholicServed + kpis.drinksNonAlcoholicServed}
            </span>
            <span className="text-xs text-muted-foreground">
              consumiciones
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <Wine className="size-3 text-vino" /> {kpis.drinksAlcoholicServed} con alcohol
            </span>
            <span className="flex items-center gap-1">
              <GlassWater className="size-3 text-cielo" /> {kpis.drinksNonAlcoholicServed} sin alcohol
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

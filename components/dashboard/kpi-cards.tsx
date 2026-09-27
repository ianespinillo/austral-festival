import {
  DollarSign,
  Users,
  UserCheck,
  Wine,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardKPIs } from "@/lib/dashboard/types";
import { formatARS } from "@/lib/dashboard/format";

interface KPICardsProps {
  kpis: DashboardKPIs;
}

export function KPICards({ kpis }: KPICardsProps) {
  const formattedRevenue = formatARS(kpis.totalRevenue);
  const formattedAvg = formatARS(kpis.averageOrderValue);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Recaudación y Finanzas */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recaudación Aprobada
          </CardTitle>
          <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <DollarSign className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="text-3xl font-extrabold font-sans text-primary tracking-tight tabular-nums">
            {formattedRevenue}
          </div>
          <p className="text-xs text-muted-foreground">
            <strong className="font-semibold text-foreground">{kpis.paidPurchasesCount}</strong> órdenes pagadas · {formattedAvg} prom.
          </p>
        </CardContent>
      </Card>

      {/* 2. Capacidad y Aforo */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Entradas y Aforo
          </CardTitle>
          <div className="grid size-8 place-items-center rounded-lg bg-oro/20 text-oro">
            <Users className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-sans text-foreground tracking-tight tabular-nums">
              {kpis.totalTicketsSold}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              de {kpis.totalCapacity} cupo total
            </span>
          </div>
          <Progress value={kpis.capacityRate} className="h-2 bg-muted [&>div]:bg-oro" />
          <p className="text-xs text-muted-foreground">
            <strong className="font-semibold text-foreground">{kpis.remainingCapacity}</strong> cupos libres ({kpis.capacityRate}% cubierto)
          </p>
        </CardContent>
      </Card>

      {/* 3. Operación de Puerta y Flujo */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Presentes en el Predio
          </CardTitle>
          <div className="grid size-8 place-items-center rounded-lg bg-pampa/15 text-pampa">
            <UserCheck className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-sans text-pampa tracking-tight tabular-nums">
              {kpis.totalTicketsCheckedIn}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {kpis.attendanceRate}% del total
            </span>
          </div>
          <Progress value={kpis.attendanceRate} className="h-2 bg-muted [&>div]:bg-pampa" />
          <p className="text-xs text-muted-foreground">
            <strong className="font-semibold text-foreground">{kpis.totalTicketsPending}</strong> por llegar · {kpis.adultsCheckedIn} mayores / {kpis.minorsCheckedIn} menores
          </p>
        </CardContent>
      </Card>

      {/* 4. Barra & Consumos */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Bebidas Servidas
          </CardTitle>
          <div className="grid size-8 place-items-center rounded-lg bg-cielo/20 text-cielo">
            <Wine className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="text-3xl font-extrabold font-sans text-foreground tracking-tight tabular-nums">
            {kpis.drinksTotalServed}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-vino">{kpis.drinksAlcoholicServed}</span> con alcohol · <span className="font-semibold text-cielo">{kpis.drinksNonAlcoholicServed}</span> sin alcohol
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
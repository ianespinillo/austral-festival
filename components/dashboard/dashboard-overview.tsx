"use client";

import {
  UtensilsCrossed,
  ArrowRight,
  Tag,
  Sparkles,
  Leaf,
  Fish,
  Heart,
  UserCheck,
  CreditCard,
  DoorOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DashboardData } from "@/lib/dashboard/types";
import { formatARS } from "@/lib/dashboard/format";
import { KPICards } from "./kpi-cards";

interface DashboardOverviewProps {
  data: DashboardData;
  onSelectTab: (tab: string) => void;
}

export function DashboardOverview({ data, onSelectTab }: DashboardOverviewProps) {
  const { kpis } = data;

  return (
    <div className="space-y-6">
      {/* 1. KPIs Principales en 4 tarjetas limpias */}
      <KPICards kpis={kpis} />

      {/* 2. Dos paneles ejecutivos de estado balanceados */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Panel A: Pulso Financiero y Ventas */}
        <Card className="border-border/80 bg-card shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="border-b border-border/50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                  <CreditCard className="size-4 text-primary" />
                  Ventas por Categoría de Entrada
                </CardTitle>
                <span className="text-xs font-semibold text-muted-foreground">
                  {kpis.tierBreakdown.length} categorías
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3">
                {kpis.tierBreakdown.map((tier) => (
                  <div key={tier.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Tag className="size-3 text-muted-foreground" />
                        {tier.name}
                      </span>
                      <span className="font-bold text-primary tabular-nums">{formatARS(tier.revenue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={tier.percentageOfRevenue} className="h-2 bg-muted [&>div]:bg-primary" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap min-w-16 text-right tabular-nums">
                        {tier.ticketsSold} un. ({tier.percentageOfRevenue}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sub-bloque de Donaciones Solidarias */}
              <div className="rounded-lg bg-muted/40 border border-border/50 p-3 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Modalidad Asistir:</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatARS(kpis.totalRevenue - kpis.donationsRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-vino">
                    <Heart className="size-3" /> Donaciones Solidarias ({kpis.donationsCount}):
                  </span>
                  <span className="font-bold text-vino tabular-nums">
                    {formatARS(kpis.donationsRevenue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </div>

          <div className="p-4 pt-0 border-t border-border/40 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectTab("purchases")}
              className="w-full text-xs text-primary font-semibold hover:bg-primary/10 justify-between"
            >
              <span>Ver libro completo de ventas ({kpis.totalPurchases} órdenes)</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </Card>

        {/* Panel B: Pulso Operativo (Puerta + Cocina) */}
        <Card className="border-border/80 bg-card shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="border-b border-border/50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                  <DoorOpen className="size-4 text-pampa" />
                  Operación en Vivo: Puerta & Cocina
                </CardTitle>
                <span className="text-xs font-semibold text-pampa">
                  {kpis.totalTicketsCheckedIn} de {kpis.totalTicketsSold} adentro
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Acceso en Puerta */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <UserCheck className="size-3.5 text-pampa" /> Acreditación en Puerta
                  </span>
                  <span className="font-bold text-foreground tabular-nums">
                    {kpis.attendanceRate}% ingresados
                  </span>
                </div>
                <Progress value={kpis.attendanceRate} className="h-2 bg-muted [&>div]:bg-pampa" />
                <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>{kpis.totalTicketsCheckedIn} en el predio</span>
                  <span className="font-semibold text-oro">{kpis.totalTicketsPending} por llegar</span>
                </div>
              </div>

              {/* Dietas especiales en sala para cocina */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <UtensilsCrossed className="size-3.5 text-oro" /> Menús Especiales en Sala
                  </span>
                  <span className="text-xs font-bold text-oro">
                    {kpis.dietCounts.checkedIn.celiaco +
                      kpis.dietCounts.checkedIn.vegetariano +
                      kpis.dietCounts.checkedIn.sin_carne_viernes}{" "}
                    comensales presentes
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="rounded-lg bg-muted/40 border border-border/50 p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-oro">
                      <Sparkles className="size-3" /> Sin TACC
                    </div>
                    <div className="mt-1 text-base font-bold font-sans text-foreground tabular-nums">
                      {kpis.dietCounts.checkedIn.celiaco}{" "}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        / {kpis.dietCounts.celiaco}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/40 border border-border/50 p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-pampa">
                      <Leaf className="size-3" /> Veggies
                    </div>
                    <div className="mt-1 text-base font-bold font-sans text-foreground tabular-nums">
                      {kpis.dietCounts.checkedIn.vegetariano}{" "}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        / {kpis.dietCounts.vegetariano}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/40 border border-border/50 p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-cielo">
                      <Fish className="size-3" /> Vigilia
                    </div>
                    <div className="mt-1 text-base font-bold font-sans text-foreground tabular-nums">
                      {kpis.dietCounts.checkedIn.sin_carne_viernes}{" "}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        / {kpis.dietCounts.sin_carne_viernes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>

          <div className="p-4 pt-0 border-t border-border/40 mt-2 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectTab("tickets")}
              className="text-xs text-primary font-semibold hover:bg-primary/10"
            >
              <span>Ver Acreditaciones</span>
              <ArrowRight className="size-3 ml-1" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectTab("catering")}
              className="text-xs text-primary font-semibold hover:bg-primary/10"
            >
              <span>Ver Cocina</span>
              <ArrowRight className="size-3 ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

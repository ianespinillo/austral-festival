"use client";

import { useState } from "react";
import {
  Download,
  Calendar,
  MapPin,
  Database,
  Layers,
  LayoutDashboard,
  Users,
  CreditCard,
  UtensilsCrossed,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardData } from "@/lib/dashboard/types";
import { getMockDashboardData } from "@/lib/dashboard/mock-data";
import { exportPurchasesToCSV, exportTicketsToCSV } from "@/lib/dashboard/export-utils";
import { KPICards } from "./kpi-cards";
import { TicketsTable } from "./tickets-table";
import { PurchasesTable } from "./purchases-table";
import { CateringSummary } from "./catering-summary";
import { VolunteersRanking } from "./volunteers-ranking";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardClientProps {
  initialData: DashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [useMock, setUseMock] = useState<boolean>(initialData.isMockData);
  const mockData = getMockDashboardData();

  const currentData = useMock ? mockData : initialData;

  const handleExportTickets = () => {
    exportTicketsToCSV(currentData.tickets, `asistentes_peña_${useMock ? "demo" : "db"}.csv`);
    toast.success("Descargando nómina de asistentes para Excel");
  };

  const handleExportPurchases = () => {
    exportPurchasesToCSV(currentData.purchases, `ventas_peña_${useMock ? "demo" : "db"}.csv`);
    toast.success("Descargando libro de ventas para Excel");
  };

  const handleToggleSource = (mock: boolean) => {
    setUseMock(mock);
    toast.info(mock ? "Mostrando datos mockeados para demostración" : "Conectado a la base de datos");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Encabezado principal */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="size-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              Dashboard Operativo y Financiero
            </h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground">
              {currentData.eventName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5 text-primary" />
              {new Date(currentData.eventDate).toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 text-pampa" />
              {currentData.eventVenue}
            </span>
          </div>
        </div>

        {/* Acciones globales */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Switch Data Source */}
          <div className="flex items-center rounded-lg border border-border/80 bg-muted/60 p-1 text-xs">
            <button
              onClick={() => handleToggleSource(false)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-colors ${
                !useMock
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Database className="size-3.5 text-primary" />
              Base de Datos
            </button>
            <button
              onClick={() => handleToggleSource(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-colors ${
                useMock
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-3.5" />
              Datos Mockeados MVP
            </button>
          </div>

          {/* Exportar Excel */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTickets}
              className="border-border/80 text-xs font-semibold gap-1.5 bg-card"
            >
              <Download className="size-3.5 text-pampa" />
              Asistentes (CSV)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPurchases}
              className="border-border/80 text-xs font-semibold gap-1.5 bg-card"
            >
              <Download className="size-3.5 text-primary" />
              Ventas (CSV)
            </Button>
          </div>
        </div>
      </div>

      {/* Banner informativo si está en modo mock */}
      {useMock && (
        <div className="flex items-center justify-between rounded-lg border border-oro/40 bg-oro/15 px-4 py-2.5 text-xs text-amber-950 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-full bg-oro text-amber-950 font-bold text-[11px]">
              i
            </span>
            <span>
              <strong>Modo Demostración Activo:</strong> Visualizando {currentData.tickets.length} entradas y {currentData.purchases.length} compras de prueba para previsualizar todas las métricas operativas.
            </span>
          </div>
          <button
            onClick={() => handleToggleSource(false)}
            className="underline font-semibold hover:opacity-80 ml-2 whitespace-nowrap"
          >
            Ver datos reales de DB
          </button>
        </div>
      )}

      {/* Navegación por Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/70 p-1 border border-border/60 flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-card data-[state=active]:text-primary font-medium text-xs sm:text-sm gap-1.5"
          >
            <LayoutDashboard className="size-4" />
            Resumen & KPIs
          </TabsTrigger>
          <TabsTrigger
            value="tickets"
            className="data-[state=active]:bg-card data-[state=active]:text-primary font-medium text-xs sm:text-sm gap-1.5"
          >
            <Users className="size-4" />
            Asistentes / Puerta ({currentData.tickets.length})
          </TabsTrigger>
          <TabsTrigger
            value="purchases"
            className="data-[state=active]:bg-card data-[state=active]:text-primary font-medium text-xs sm:text-sm gap-1.5"
          >
            <CreditCard className="size-4" />
            Ventas & Finanzas ({currentData.purchases.length})
          </TabsTrigger>
          <TabsTrigger
            value="catering"
            className="data-[state=active]:bg-card data-[state=active]:text-primary font-medium text-xs sm:text-sm gap-1.5"
          >
            <UtensilsCrossed className="size-4" />
            Cocina & Dietas
          </TabsTrigger>
          <TabsTrigger
            value="volunteers"
            className="data-[state=active]:bg-card data-[state=active]:text-primary font-medium text-xs sm:text-sm gap-1.5"
          >
            <Trophy className="size-4" />
            Voluntarios
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Resumen y KPIs */}
        <TabsContent value="overview" className="space-y-6">
          <KPICards kpis={currentData.kpis} />

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Resumen de Puerta en Vivo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
                  <Users className="size-4 text-pampa" />
                  Últimos Ingresos en Puerta
                </h2>
                <span className="text-xs text-muted-foreground font-medium">
                  {currentData.kpis.totalTicketsCheckedIn} de {currentData.kpis.totalTicketsSold} presentes
                </span>
              </div>
              <TicketsTable tickets={currentData.tickets.slice(0, 8)} />
            </div>

            {/* Resumen de Dietas y Voluntarios */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
                  <UtensilsCrossed className="size-4 text-oro" />
                  Demandas de Cocina
                </h2>
                <CateringSummary dietCounts={currentData.kpis.dietCounts} tickets={currentData.tickets} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Asistentes y Puerta completa */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-display text-foreground">
                Control de Acreditaciones y Asistentes
              </h2>
              <p className="text-xs text-muted-foreground">
                Reemplaza la planilla de puerta física. Permite auditar ingresos en tiempo real, mayoría de edad y consumición de bebidas.
              </p>
            </div>
          </div>
          <TicketsTable tickets={currentData.tickets} />
        </TabsContent>

        {/* Tab 3: Ventas y Finanzas completa */}
        <TabsContent value="purchases" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-display text-foreground">
                Registro de Ventas, Pagos y Donaciones
              </h2>
              <p className="text-xs text-muted-foreground">
                Reemplaza el libro de tesorería. Detalle de órdenes con id de pago MercadoPago y canal de venta referente.
              </p>
            </div>
          </div>
          <PurchasesTable purchases={currentData.purchases} />
        </TabsContent>

        {/* Tab 4: Cocina y Dietas */}
        <TabsContent value="catering" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-display text-foreground">
                Planificación de Cocina y Menú Especial
              </h2>
              <p className="text-xs text-muted-foreground">
                Conteo para los proveedores de alimentos y nómina de comensales con celiaquía o requerimientos específicos.
              </p>
            </div>
          </div>
          <CateringSummary dietCounts={currentData.kpis.dietCounts} tickets={currentData.tickets} />
        </TabsContent>

        {/* Tab 5: Ranking de Voluntarios */}
        <TabsContent value="volunteers" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-display text-foreground">
                Desempeño de Voluntarios y Referentes
              </h2>
              <p className="text-xs text-muted-foreground">
                Total de ventas y recaudación aportada por cada embajador de la peña.
              </p>
            </div>
          </div>
          <VolunteersRanking rankings={currentData.kpis.volunteerRankings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

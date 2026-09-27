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
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardData } from "@/lib/dashboard/types";
import { getMockDashboardData } from "@/lib/dashboard/mock-data";
import { exportPurchasesToCSV, exportTicketsToCSV } from "@/lib/dashboard/export-utils";
import { DashboardOverview } from "./dashboard-overview";
import { TicketsTable } from "./tickets-table";
import { PurchasesTable } from "./purchases-table";
import { CateringSummary } from "./catering-summary";
import { VolunteersRanking } from "./volunteers-ranking";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardClientProps {
  initialData: DashboardData;
}

/** Encabezado unificado de página dentro de cada tab (tipografía display). */
function TabPageHeader({
  title,
  description,
  badgeText,
}: {
  title: string;
  description: string;
  badgeText?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold font-sans text-foreground tracking-tight">{title}</h2>
        <p className="max-w-2xl text-xs text-muted-foreground">{description}</p>
      </div>
      {badgeText && (
        <span className="self-start sm:self-center inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {badgeText}
        </span>
      )}
    </div>
  );
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [useMock, setUseMock] = useState<boolean>(initialData.isMockData);
  const [activeTab, setActiveTab] = useState<string>("overview");

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
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <LayoutDashboard className="size-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-foreground">
              Dashboard de Gestión Operativa
            </h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold text-foreground">
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

          {/* Badges de estado rápido */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-pampa/15 text-pampa px-2.5 py-0.5 rounded-full border border-pampa/30">
              <UserCheck className="size-3" />
              {currentData.kpis.totalTicketsCheckedIn} en el predio ({currentData.kpis.attendanceRate}% asistencia)
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-oro/15 text-oro px-2.5 py-0.5 rounded-full border border-oro/30">
              {currentData.kpis.remainingCapacity} cupos disponibles ({currentData.kpis.capacityRate}% cubierto)
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              {currentData.kpis.totalPurchases} órdenes confirmadas
            </span>
          </div>
        </div>

        {/* Acciones globales */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {/* Switch Data Source */}
          <div className="flex items-center rounded-lg border border-border/80 bg-muted/60 p-1 text-xs">
            <button
              onClick={() => handleToggleSource(false)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-colors ${
                !useMock
                  ? "bg-card text-foreground shadow-xs font-semibold"
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
              Datos Mock MVP
            </button>
          </div>

          {/* Exportar Excel */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTickets}
              className="border-border/80 text-xs font-semibold gap-1.5 bg-card hover:bg-muted/50"
            >
              <Download className="size-3.5 text-pampa" />
              Asistentes (CSV)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPurchases}
              className="border-border/80 text-xs font-semibold gap-1.5 bg-card hover:bg-muted/50"
            >
              <Download className="size-3.5 text-primary" />
              Ventas (CSV)
            </Button>
          </div>
        </div>
      </div>

      {/* Banner informativo si está en modo mock */}
      {useMock && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#D4A359] bg-[#FFF8EB] p-4 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#8F5B00] text-white font-bold text-xs shadow-xs">
              i
            </span>
            <div className="text-[#3B2A1B] leading-relaxed">
              <span className="font-bold text-[#643E08] mr-1">
                Modo Demostración Activo:
              </span>
              <span className="text-[#4A3726]">
                Visualizando {currentData.tickets.length} entradas y {currentData.purchases.length} compras de prueba para auditoría y simulación en tiempo real.
              </span>
            </div>
          </div>
          <button
            onClick={() => handleToggleSource(false)}
            className="inline-flex items-center justify-center shrink-0 rounded-lg bg-[#7A4B1A] px-3.5 py-1.5 text-xs font-semibold text-[#FCF6E9] shadow-xs hover:bg-[#633B12] transition-colors"
          >
            Ver datos reales de DB
          </button>
        </div>
      )}

      {/* Navegación por Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full flex flex-wrap sm:flex-nowrap items-stretch gap-1.5 group-data-horizontal/tabs:!h-auto p-1.5 bg-card/90 border border-border/80 rounded-xl shadow-xs overflow-x-auto">
          <TabsTrigger
            value="overview"
            className="group/tab !h-auto flex-1 min-w-[130px] justify-center px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all data-active:!bg-primary data-active:!text-primary-foreground data-active:!shadow-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2 border border-transparent"
          >
            <LayoutDashboard className="size-4 shrink-0" />
            <span>Visión General</span>
          </TabsTrigger>
          <TabsTrigger
            value="tickets"
            className="group/tab !h-auto flex-1 min-w-[170px] justify-center px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all data-active:!bg-primary data-active:!text-primary-foreground data-active:!shadow-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2 border border-transparent"
          >
            <Users className="size-4 shrink-0" />
            <span>Acreditaciones</span>
            <span className="rounded-full px-2 py-0.5 text-[11px] font-bold bg-muted/80 text-muted-foreground group-data-active/tab:!bg-white/20 group-data-active/tab:!text-white">
              {currentData.tickets.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="purchases"
            className="group/tab !h-auto flex-1 min-w-[150px] justify-center px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all data-active:!bg-primary data-active:!text-primary-foreground data-active:!shadow-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2 border border-transparent"
          >
            <CreditCard className="size-4 shrink-0" />
            <span>Finanzas</span>
            <span className="rounded-full px-2 py-0.5 text-[11px] font-bold bg-muted/80 text-muted-foreground group-data-active/tab:!bg-white/20 group-data-active/tab:!text-white">
              {currentData.purchases.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="catering"
            className="group/tab !h-auto flex-1 min-w-[170px] justify-center px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all data-active:!bg-primary data-active:!text-primary-foreground data-active:!shadow-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2 border border-transparent"
          >
            <UtensilsCrossed className="size-4 shrink-0" />
            <span>Cocina & Dietas</span>
            <span className="rounded-full px-2 py-0.5 text-[11px] font-bold bg-muted/80 text-muted-foreground group-data-active/tab:!bg-white/20 group-data-active/tab:!text-white">
              {currentData.kpis.dietCounts.total}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="volunteers"
            className="group/tab !h-auto flex-1 min-w-[140px] justify-center px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all data-active:!bg-primary data-active:!text-primary-foreground data-active:!shadow-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2 border border-transparent"
          >
            <Trophy className="size-4 shrink-0" />
            <span>Voluntarios</span>
            <span className="rounded-full px-2 py-0.5 text-[11px] font-bold bg-muted/80 text-muted-foreground group-data-active/tab:!bg-white/20 group-data-active/tab:!text-white">
              {currentData.kpis.volunteerRankings.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Visión General (Overview separado y rico en métricas) */}
        <TabsContent value="overview" className="space-y-6">
          <DashboardOverview data={currentData} onSelectTab={setActiveTab} />
        </TabsContent>

        {/* Tab 2: Asistentes y Puerta completa */}
        <TabsContent value="tickets" className="space-y-4">
          <TabPageHeader
            title="Control de Acreditaciones y Asistentes"
            description="Reemplaza la planilla física de puerta. Audita ingresos en tiempo real, verifica mayoría de edad y controla el cupo de compra de bebidas con alcohol en barra."
            badgeText={`${currentData.kpis.totalTicketsCheckedIn} acreditados en predio`}
          />
          <TicketsTable tickets={currentData.tickets} />
        </TabsContent>

        {/* Tab 3: Ventas y Finanzas completa */}
        <TabsContent value="purchases" className="space-y-4">
          <TabPageHeader
            title="Registro de Ventas, Pagos y Donaciones"
            description="Reemplaza el libro de tesorería. Detalle de órdenes con id de pago MercadoPago, desglose por ticket y canal de venta referente."
            badgeText={`${currentData.kpis.paidPurchasesCount} órdenes pagadas`}
          />
          <PurchasesTable purchases={currentData.purchases} />
        </TabsContent>

        {/* Tab 4: Cocina y Dietas */}
        <TabsContent value="catering" className="space-y-4">
          <TabPageHeader
            title="Planificación de Cocina, Buffet y Menús Especiales"
            description="Conteo para los proveedores de alimentos y nómina de comensales con celiaquía (Sin TACC), dietas vegetarianas o vigilia de viernes."
            badgeText={`${currentData.kpis.dietCounts.checkedIn.celiaco + currentData.kpis.dietCounts.checkedIn.vegetariano + currentData.kpis.dietCounts.checkedIn.sin_carne_viernes} especiales ya en sala`}
          />
          <CateringSummary dietCounts={currentData.kpis.dietCounts} tickets={currentData.tickets} />
        </TabsContent>

        {/* Tab 5: Ranking de Voluntarios */}
        <TabsContent value="volunteers" className="space-y-4">
          <TabPageHeader
            title="Desempeño de Voluntarios y Embajadores"
            description="Total de ventas, recaudación y aporte sobre el total de fondos generados por cada voluntario referente de la peña."
            badgeText={`${currentData.kpis.volunteersRevenueShare}% recaudado por red`}
          />
          <VolunteersRanking rankings={currentData.kpis.volunteerRankings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
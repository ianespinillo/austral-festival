"use client";

import { useState, useMemo } from "react";
import {
  UtensilsCrossed,
  Sparkles,
  Leaf,
  Fish,
  Beef,
  AlertTriangle,
  UserCheck,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { DashboardTicket, DietSummary } from "@/lib/dashboard/types";
import { DietBadge } from "./diet-badges";
import { TablePagination } from "./table-pagination";

interface CateringSummaryProps {
  dietCounts: DietSummary;
  tickets: DashboardTicket[];
}

const DEFAULT_PAGE_SIZE = 10;

export function CateringSummary({ dietCounts, tickets }: CateringSummaryProps) {
  const [search, setSearch] = useState("");
  const [dietFilter, setDietFilter] = useState<string>("all");
  const [onlyCheckedIn, setOnlyCheckedIn] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleDietChange = (val: string) => {
    setDietFilter(val);
    setCurrentPage(1);
  };

  const handleToggleCheckedIn = () => {
    setOnlyCheckedIn(!onlyCheckedIn);
    setCurrentPage(1);
  };

  const specialTickets = useMemo(() => {
    return tickets.filter((t) => t.diet !== "regular" && t.status !== "cancelled");
  }, [tickets]);

  const filteredSpecialTickets = useMemo(() => {
    return specialTickets.filter((t) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        t.holderName.toLowerCase().includes(term) ||
        t.holderDni.includes(term) ||
        t.qrCode.toLowerCase().includes(term);

      const matchesDiet = dietFilter === "all" || t.diet === dietFilter;
      const matchesPresence = !onlyCheckedIn || t.status === "used";

      return matchesSearch && matchesDiet && matchesPresence;
    });
  }, [specialTickets, search, dietFilter, onlyCheckedIn]);

  const totalPages = Math.ceil(filteredSpecialTickets.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedSpecialTickets = filteredSpecialTickets.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const totalSpecial = dietCounts.celiaco + dietCounts.vegetariano + dietCounts.sin_carne_viernes;
  const specialCheckedIn =
    dietCounts.checkedIn.celiaco +
    dietCounts.checkedIn.vegetariano +
    dietCounts.checkedIn.sin_carne_viernes;

  const calcPercentage = (val: number) => {
    if (dietCounts.total === 0) return 0;
    return Math.round((val / dietCounts.total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Franja Informativa de Operación de Cocina */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border/80 bg-card p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <UtensilsCrossed className="size-3.5 text-primary" />
            <span>Total Comensales</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-sans text-foreground tabular-nums">
            {dietCounts.total}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Platos previstos en el evento
          </div>
        </div>

        <div className="rounded-lg border border-oro/40 bg-oro/10 p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-oro font-semibold">
            <Sparkles className="size-3.5" />
            <span>Menús Especiales</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-sans text-oro tabular-nums">
            {totalSpecial}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              ({calcPercentage(totalSpecial)}%)
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Celíacos, Veg y Vigilia
          </div>
        </div>

        <div className="rounded-lg border border-pampa/40 bg-pampa/10 p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-pampa font-semibold">
            <UserCheck className="size-3.5" />
            <span>Especiales en Predio</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-sans text-pampa tabular-nums">
            {specialCheckedIn} / {totalSpecial}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {totalSpecial > 0 ? Math.round((specialCheckedIn / totalSpecial) * 100) : 0}% listos para servir
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-card p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Beef className="size-3.5 text-foreground" />
            <span>Menú Regular</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-sans text-foreground tabular-nums">
            {dietCounts.regular}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              ({calcPercentage(dietCounts.regular)}%)
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {dietCounts.checkedIn.regular} en el predio
          </div>
        </div>
      </div>

      {/* Tarjetas informativas de categorías dietarias con advertencias */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Celíacos */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-oro">
                Atención Crítica
              </span>
              <CardTitle className="text-sm font-semibold text-foreground">
                Celíacos (Sin TACC)
              </CardTitle>
            </div>
            <div className="grid size-8 place-items-center rounded-lg bg-oro/20 text-oro">
              <Sparkles className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-sans text-oro tabular-nums">
                {dietCounts.celiaco}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {dietCounts.checkedIn.celiaco} ya en el predio
              </span>
            </div>
            <Progress
              value={dietCounts.celiaco > 0 ? (dietCounts.checkedIn.celiaco / dietCounts.celiaco) * 100 : 0}
              className="h-1.5 bg-muted [&>div]:bg-oro"
            />
            <p className="text-xs text-oro font-medium flex items-start gap-1 pt-1">
              <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-oro" />
              Empaque individual hermético. Cero contaminación cruzada.
            </p>
          </CardContent>
        </Card>

        {/* Vegetarianos */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-pampa">
                Menú Vegetal
              </span>
              <CardTitle className="text-sm font-semibold text-foreground">
                Vegetarianos
              </CardTitle>
            </div>
            <div className="grid size-8 place-items-center rounded-lg bg-pampa/20 text-pampa">
              <Leaf className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-sans text-pampa tabular-nums">
                {dietCounts.vegetariano}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {dietCounts.checkedIn.vegetariano} ya en el predio
              </span>
            </div>
            <Progress
              value={dietCounts.vegetariano > 0 ? (dietCounts.checkedIn.vegetariano / dietCounts.vegetariano) * 100 : 0}
              className="h-1.5 bg-muted [&>div]:bg-pampa"
            />
            <p className="text-xs text-muted-foreground pt-1">
              Empanadas de verdura, choclo cremoso y queso criollo.
            </p>
          </CardContent>
        </Card>

        {/* Sin carne viernes */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cielo">
                Vigilia Tradicional
              </span>
              <CardTitle className="text-sm font-semibold text-foreground">
                Sin Carne Viernes
              </CardTitle>
            </div>
            <div className="grid size-8 place-items-center rounded-lg bg-cielo/20 text-cielo">
              <Fish className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-sans text-cielo tabular-nums">
                {dietCounts.sin_carne_viernes}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {dietCounts.checkedIn.sin_carne_viernes} ya en el predio
              </span>
            </div>
            <Progress
              value={dietCounts.sin_carne_viernes > 0 ? (dietCounts.checkedIn.sin_carne_viernes / dietCounts.sin_carne_viernes) * 100 : 0}
              className="h-1.5 bg-muted [&>div]:bg-cielo"
            />
            <p className="text-xs text-muted-foreground pt-1">
              Preferencias tradicionales de vigilia / cuaresma.
            </p>
          </CardContent>
        </Card>

        {/* Regulares */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Cocina Criolla
              </span>
              <CardTitle className="text-sm font-semibold text-foreground">
                Menú Regular
              </CardTitle>
            </div>
            <div className="grid size-8 place-items-center rounded-lg bg-muted text-foreground">
              <Beef className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-sans text-foreground tabular-nums">
                {dietCounts.regular}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {dietCounts.checkedIn.regular} ya en el predio
              </span>
            </div>
            <Progress
              value={dietCounts.regular > 0 ? (dietCounts.checkedIn.regular / dietCounts.regular) * 100 : 0}
              className="h-1.5 bg-muted [&>div]:bg-foreground"
            />
            <p className="text-xs text-muted-foreground pt-1">
              Parrilla tradicional, asado al asador y empanadas salteñas.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Nómina interactiva para el buffet / entrega de viandas con paginación */}
      <Card className="border-border/80 bg-card shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/60 pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <UtensilsCrossed className="size-4 text-primary" />
                Padrón de Dietas Especiales para Cocina y Buffet ({filteredSpecialTickets.length})
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Permite buscar comensales rápidamente por DNI o Nombre al momento de entregar viandas rotuladas.
              </p>
            </div>

            {/* Filtros rápidos para el personal de cocina */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48 sm:w-56">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por DNI o nombre..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-8 h-8 text-xs bg-muted/40 border-border/80"
                />
              </div>

              <select
                value={dietFilter}
                onChange={(e) => handleDietChange(e.target.value)}
                className="h-8 rounded-md border border-border/80 bg-card px-2 text-xs text-foreground focus:outline-none"
              >
                <option value="all">Todas las especiales</option>
                <option value="celiaco">Celíacos</option>
                <option value="vegetariano">Vegetarianos</option>
                <option value="sin_carne_viernes">Sin carne viernes</option>
              </select>

              <button
                type="button"
                onClick={handleToggleCheckedIn}
                className={`h-8 px-2.5 rounded-md text-xs font-semibold border transition-colors flex items-center gap-1 ${
                  onlyCheckedIn
                    ? "bg-pampa text-white border-pampa"
                    : "border-border/80 bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserCheck className="size-3.5" />
                <span>Solo presentes ({specialCheckedIn})</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60 text-sm">
            {paginatedSpecialTickets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No se encontraron comensales especiales con los filtros aplicados.
              </div>
            ) : (
              paginatedSpecialTickets.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 hover:bg-muted/20 gap-2 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      {t.holderName}
                      <span className="font-mono text-xs text-muted-foreground">
                        (DNI: {t.holderDni})
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ticket: <span className="font-mono text-primary font-semibold">{t.qrCode}</span> · Entrada: {t.tierName}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DietBadge diet={t.diet} />
                    <span className="text-xs font-medium">
                      {t.status === "used" ? (
                        <span className="inline-flex items-center gap-1 text-pampa font-semibold">
                          <UserCheck className="size-3.5" /> En el predio
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Aún no ingresó</span>
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>

        {/* Paginación */}
        <TablePagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={filteredSpecialTickets.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          itemName="comensales"
        />
      </Card>
    </div>
  );
}

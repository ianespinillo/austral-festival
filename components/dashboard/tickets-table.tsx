"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Wine,
  GlassWater,
  ShieldAlert,
  XCircle,
  Users,
  UserCheck,
  Hourglass,
  Baby,
} from "lucide-react";
import { DashboardTicket, TicketStatus } from "@/lib/dashboard/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "cn";
import {
  SearchInput,
  SegmentedControl,
  FilterSelect,
  SegmentOption,
} from "./table-controls";
import { DietBadge } from "./diet-badges";
import { TablePagination } from "./table-pagination";

interface TicketsTableProps {
  tickets: DashboardTicket[];
  /** Preview compacto sin controles y con columnas reducidas (para el overview). */
  compact?: boolean;
}

type StatusFilter = TicketStatus | "all";

const DIET_OPTIONS = [
  { value: "all", label: "Todas las dietas" },
  { value: "regular", label: "Regular" },
  { value: "celiaco", label: "Celíaco (Sin TACC)" },
  { value: "vegetariano", label: "Vegetariano" },
  { value: "sin_carne_viernes", label: "Sin carne viernes" },
];

const AGE_OPTIONS = [
  { value: "all", label: "Todas las edades" },
  { value: "adult", label: "Solo Adultos (+18)" },
  { value: "minor", label: "Solo Menores (<18)" },
];

const DEFAULT_PAGE_SIZE = 10;

export function TicketsTable({ tickets, compact = false }: TicketsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dietFilter, setDietFilter] = useState<string>("all");
  const [ageFilter, setAgeFilter] = useState<string>("all");
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

  const handleStatusChange = (val: StatusFilter) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleDietChange = (val: string) => {
    setDietFilter(val);
    setCurrentPage(1);
  };

  const handleAgeChange = (val: string) => {
    setAgeFilter(val);
    setCurrentPage(1);
  };

  const totalUsed = tickets.filter((t) => t.status === "used").length;
  const totalActive = tickets.filter((t) => t.status === "active").length;
  const totalCancelled = tickets.filter((t) => t.status === "cancelled").length;
  const totalMinors = tickets.filter((t) => !t.isAdult && t.status !== "cancelled").length;

  const statusOptions: SegmentOption<StatusFilter>[] = [
    { value: "all", label: "Todos", count: tickets.length },
    {
      value: "used",
      label: "Ingresados",
      count: totalUsed,
      activeClassName: "bg-pampa text-white",
    },
    {
      value: "active",
      label: "Pendientes",
      count: totalActive,
      activeClassName: "bg-oro text-amber-950 font-bold",
    },
    {
      value: "cancelled",
      label: "Cancelados",
      count: totalCancelled,
      activeClassName: "bg-foreground text-background",
    },
  ];

  const filteredTickets = tickets.filter((t) => {
    // Búsqueda
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      t.holderName.toLowerCase().includes(term) ||
      t.holderDni.includes(term) ||
      t.qrCode.toLowerCase().includes(term) ||
      (t.referringVolunteer && t.referringVolunteer.toLowerCase().includes(term)) ||
      t.buyerName.toLowerCase().includes(term);

    // Estado
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    // Dieta
    const matchesDiet = dietFilter === "all" || t.diet === dietFilter;

    // Edad
    const matchesAge =
      ageFilter === "all" ||
      (ageFilter === "adult" && t.isAdult) ||
      (ageFilter === "minor" && !t.isAdult);

    return matchesSearch && matchesStatus && matchesDiet && matchesAge;
  });

  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedTickets = compact
    ? filteredTickets.slice(0, 8)
    : filteredTickets.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const tableColSpan = compact ? 5 : 7;

  return (
    <div className="space-y-4">
      {/* Franja Informativa de Operación de Puerta */}
      {!compact && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-card p-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Users className="size-3.5 text-primary" />
              <span>Total Emitidas</span>
            </div>
            <div className="mt-1 text-2xl font-bold font-sans text-foreground tabular-nums">
              {tickets.length}
            </div>
          </div>
          <div className="rounded-lg border border-pampa/40 bg-pampa/10 p-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-pampa font-semibold">
              <UserCheck className="size-3.5" />
              <span>En el Predio</span>
            </div>
            <div className="mt-1 text-2xl font-bold font-sans text-pampa tabular-nums">
              {totalUsed}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({tickets.length > 0 ? Math.round((totalUsed / tickets.length) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-oro/40 bg-oro/10 p-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-oro font-semibold">
              <Hourglass className="size-3.5" />
              <span>Por Ingresar</span>
            </div>
            <div className="mt-1 text-2xl font-bold font-sans text-oro tabular-nums">
              {totalActive}
            </div>
          </div>
          <div className="rounded-lg border border-border/80 bg-card p-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Baby className="size-3.5 text-amber-700" />
              <span>Menores de Edad</span>
            </div>
            <div className="mt-1 text-2xl font-bold font-sans text-foreground tabular-nums">
              {totalMinors}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (control en barra)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controles de Búsqueda y Filtros */}
      {!compact && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            placeholder="Buscar por nombre, DNI, QR o voluntario..."
            value={search}
            onChange={handleSearchChange}
            className="w-full lg:max-w-md"
          />
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              ariaLabel="Filtrar por estado de puerta"
              options={statusOptions}
              value={statusFilter}
              onChange={handleStatusChange}
            />
            <FilterSelect
              ariaLabel="Filtrar por dieta"
              value={dietFilter}
              onChange={handleDietChange}
              options={DIET_OPTIONS}
            />
            <FilterSelect
              ariaLabel="Filtrar por grupo etario"
              value={ageFilter}
              onChange={handleAgeChange}
              options={AGE_OPTIONS}
            />
          </div>
        </div>
      )}

      {/* Tabla de Asistentes */}
      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <TableRow>
                {!compact && <TableHead className="w-[130px]">Código QR</TableHead>}
                <TableHead>Asistente / DNI</TableHead>
                <TableHead className="w-[110px]">Edad</TableHead>
                <TableHead className={compact ? "w-[150px]" : "w-[130px]"}>Dieta</TableHead>
                <TableHead className="w-[140px]">Estado Puerta</TableHead>
                <TableHead className="w-[150px]">Bebidas Tomadas</TableHead>
                {!compact && <TableHead>Voluntario / Vendedor</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {paginatedTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tableColSpan} className="h-32 text-center text-muted-foreground">
                    No se encontraron asistentes con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      ticket.status === "cancelled" && "opacity-60 bg-muted/20"
                    )}
                  >
                    {!compact && (
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {ticket.qrCode}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="font-semibold text-foreground">{ticket.holderName}</div>
                      <div className="text-xs text-muted-foreground">
                        DNI: {ticket.holderDni} · {ticket.tierName}
                      </div>
                    </TableCell>
                    <TableCell>
                      {ticket.isAdult ? (
                        <span className="inline-flex items-center rounded-full bg-secondary/80 px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                          +18 Adulto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 border border-amber-300">
                          <ShieldAlert className="size-3 text-amber-700" /> Menor
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DietBadge diet={ticket.diet} />
                    </TableCell>
                    <TableCell>
                      {ticket.status === "used" ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 font-semibold text-xs text-pampa">
                            <CheckCircle2 className="size-3.5" /> Ingresó
                          </span>
                          {ticket.checkedInAt && (
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {new Date(ticket.checkedInAt).toLocaleTimeString("es-AR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })} hs
                            </span>
                          )}
                        </div>
                      ) : ticket.status === "cancelled" ? (
                        <span className="inline-flex items-center gap-1 font-medium text-xs text-muted-foreground">
                          <XCircle className="size-3.5 text-vino" /> Cancelado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-xs text-muted-foreground">
                          <Clock className="size-3.5 text-oro" /> No ingresó
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs font-medium tabular-nums">
                        <span className="inline-flex items-center gap-1 text-vino font-semibold" title="Bebidas con alcohol consumidas / límite">
                          <Wine className="size-3" /> {ticket.alcoholicDrinksServed}/{ticket.alcoholAllowance}
                        </span>
                        <span className="text-muted-foreground">|</span>
                        <span className="inline-flex items-center gap-1 text-cielo font-semibold" title="Bebidas sin alcohol">
                          <GlassWater className="size-3" /> {ticket.nonAlcoholicDrinksServed}
                        </span>
                      </div>
                    </TableCell>
                    {!compact && (
                      <TableCell>
                        <span className="text-xs font-medium text-foreground">
                          {ticket.referringVolunteer || "Venta Directa"}
                        </span>
                        <div className="text-[11px] text-muted-foreground">
                          Compró: {ticket.buyerName}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {!compact && (
          <TablePagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredTickets.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
            itemName="asistentes"
          />
        )}
      </div>
    </div>
  );
}
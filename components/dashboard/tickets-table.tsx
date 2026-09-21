"use client";

import { useMemo, useState } from "react";
import { Search, CheckCircle2, Clock, Wine, GlassWater, ShieldAlert, Sparkles } from "lucide-react";
import { DashboardTicket } from "@/lib/dashboard/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TicketsTableProps {
  tickets: DashboardTicket[];
}

export function TicketsTable({ tickets }: TicketsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "used" | "active">("all");
  const [dietFilter, setDietFilter] = useState<string>("all");

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Filtro de búsqueda
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        t.holderName.toLowerCase().includes(term) ||
        t.holderDni.includes(term) ||
        t.qrCode.toLowerCase().includes(term) ||
        (t.referringVolunteer && t.referringVolunteer.toLowerCase().includes(term)) ||
        t.buyerName.toLowerCase().includes(term);

      // Filtro de estado
      const matchesStatus =
        statusFilter === "all" || t.status === statusFilter;

      // Filtro de dieta
      const matchesDiet =
        dietFilter === "all" || t.diet === dietFilter;

      return matchesSearch && matchesStatus && matchesDiet;
    });
  }, [tickets, search, statusFilter, dietFilter]);

  return (
    <div className="space-y-4">
      {/* Controles de Búsqueda y Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI, QR o voluntario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/80 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtros de estado */}
          <div className="flex rounded-md border border-border/80 bg-card p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos ({tickets.length})
            </button>
            <button
              onClick={() => setStatusFilter("used")}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                statusFilter === "used"
                  ? "bg-pampa text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ingresados ({tickets.filter((t) => t.status === "used").length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                statusFilter === "active"
                  ? "bg-oro text-amber-950 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pendientes ({tickets.filter((t) => t.status === "active").length})
            </button>
          </div>

          {/* Filtro de Dieta */}
          <select
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value)}
            aria-label="Filtrar por dieta"
            className="h-8 rounded-md border border-border/80 bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Todas las dietas</option>
            <option value="regular">Regular</option>
            <option value="celiaco">Celíaco (Sin TACC)</option>
            <option value="vegetariano">Vegetariano</option>
            <option value="sin_carne_viernes">Sin carne viernes</option>
          </select>
        </div>
      </div>

      {/* Tabla estilo Excel */}
      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <TableRow>
                <TableHead className="w-[140px]">Código QR</TableHead>
                <TableHead>Asistente / DNI</TableHead>
                <TableHead className="w-[100px]">Edad</TableHead>
                <TableHead className="w-[130px]">Dieta</TableHead>
                <TableHead className="w-[130px]">Estado Puerta</TableHead>
                <TableHead className="w-[150px]">Bebidas Tomadas</TableHead>
                <TableHead>Voluntario / Vendedor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No se encontraron asistentes con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {ticket.qrCode}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{ticket.holderName}</div>
                      <div className="text-xs text-muted-foreground">DNI: {ticket.holderDni}</div>
                    </TableCell>
                    <TableCell>
                      {ticket.isAdult ? (
                        <span className="inline-flex items-center rounded-full bg-secondary/80 px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                          +18 Adulto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                          <ShieldAlert className="size-3" /> Menor
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {ticket.diet === "celiaco" && (
                        <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 gap-1 font-medium">
                          <Sparkles className="size-3" /> Celíaco
                        </Badge>
                      )}
                      {ticket.diet === "vegetariano" && (
                        <Badge variant="outline" className="border-pampa/50 bg-pampa/10 text-pampa font-medium">
                          Vegetariano
                        </Badge>
                      )}
                      {ticket.diet === "sin_carne_viernes" && (
                        <Badge variant="outline" className="border-cielo/50 bg-cielo/10 text-sky-800 dark:text-cielo font-medium">
                          Sin carne vier.
                        </Badge>
                      )}
                      {ticket.diet === "regular" && (
                        <span className="text-xs text-muted-foreground">Regular</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {ticket.status === "used" ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 font-semibold text-xs text-pampa">
                            <CheckCircle2 className="size-3.5" /> Ingresó
                          </span>
                          {ticket.checkedInAt && (
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(ticket.checkedInAt).toLocaleTimeString("es-AR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })} hs
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-xs text-muted-foreground">
                          <Clock className="size-3.5 text-oro" /> No ingresó
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="inline-flex items-center gap-1 text-vino" title="Bebidas con alcohol">
                          <Wine className="size-3" /> {ticket.alcoholicDrinksServed}/{ticket.alcoholAllowance}
                        </span>
                        <span className="text-muted-foreground">|</span>
                        <span className="inline-flex items-center gap-1 text-sky-700 dark:text-cielo" title="Bebidas sin alcohol">
                          <GlassWater className="size-3" /> {ticket.nonAlcoholicDrinksServed}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-foreground">
                        {ticket.referringVolunteer || "Venta Directa"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

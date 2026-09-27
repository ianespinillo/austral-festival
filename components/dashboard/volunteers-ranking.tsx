"use client";

import { useState } from "react";
import { Trophy, Award, Medal, TrendingUp, Users, DollarSign, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VolunteerRanking } from "@/lib/dashboard/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatARS } from "@/lib/dashboard/format";
import { TablePagination } from "./table-pagination";

interface VolunteersRankingProps {
  rankings: VolunteerRanking[];
  /** Modo compacto: solo el podio top 3 (para el overview). */
  compact?: boolean;
}

const DEFAULT_PAGE_SIZE = 10;

export function VolunteersRanking({ rankings, compact = false }: VolunteersRankingProps) {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Calculamos métricas globales de canal
  const totalVolunteerRevenue = rankings.reduce((acc, v) => acc + v.totalAmount, 0);
  const totalVolunteerTickets = rankings.reduce((acc, v) => acc + v.ticketsCount, 0);
  const totalVolunteerSales = rankings.reduce((acc, v) => acc + v.salesCount, 0);
  const topVolunteer = rankings[0];

  const totalPages = Math.ceil(rankings.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedRankings = rankings.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-oro text-white font-bold text-xs shadow-xs">
          1°
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300">
          2°
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-amber-800 text-white font-bold text-xs">
          3°
        </span>
      );
    }
    return (
      <span className="text-xs text-muted-foreground font-semibold px-1.5 tabular-nums">
        {index + 1}°
      </span>
    );
  };

  const podium = rankings.length >= 2 && (
    <div className="grid gap-4 sm:grid-cols-3">
      {rankings.slice(0, 3).map((v, idx) => (
        <Card
          key={v.name}
          className={`border-border/80 bg-card shadow-xs relative overflow-hidden transition-all hover:shadow-md ${
            idx === 0 ? "ring-2 ring-oro/60 shadow-md" : ""
          }`}
        >
          {idx === 0 && (
            <div className="absolute top-0 right-0 bg-oro px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider rounded-bl-lg">
              Líder de ventas
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              {idx === 0 && <Trophy className="size-4 text-oro" />}
              {idx === 1 && <Award className="size-4 text-slate-400" />}
              {idx === 2 && <Medal className="size-4 text-amber-800" />}
              Puesto #{idx + 1}
            </CardTitle>
            <span className="text-xs font-bold text-pampa">
              {v.revenueShare}% del total
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-lg font-bold font-sans text-foreground">{v.name}</div>
              <div className="text-2xl font-extrabold font-sans text-primary mt-1 tabular-nums">
                {formatARS(v.totalAmount)}
              </div>
            </div>

            <div className="rounded-md bg-muted/40 p-2 text-xs space-y-1 border border-border/40">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Entradas vendidas:</span>
                <span className="font-semibold text-foreground tabular-nums">{v.ticketsCount} tickets</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Órdenes cerradas:</span>
                <span className="font-semibold text-foreground tabular-nums">{v.salesCount} compras</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Ticket promedio:</span>
                <span className="font-semibold text-foreground tabular-nums">{formatARS(v.averageTicketAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (compact) {
    return podium || null;
  }

  return (
    <div className="space-y-6">
      {/* Franja Informativa de Canal de Voluntarios */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-pampa/40 bg-pampa/10 p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-pampa font-semibold">
            <DollarSign className="size-3.5" />
            <span>Recaudación Total Canal</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-sans text-pampa tabular-nums">
            {formatARS(totalVolunteerRevenue)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {totalVolunteerSales} transacciones intermediadas
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-card p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Users className="size-3.5 text-primary" />
            <span>Entradas Colocadas</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-sans text-foreground tabular-nums">
            {totalVolunteerTickets} tickets
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Por la red de embajadores
          </div>
        </div>

        <div className="rounded-lg border border-oro/40 bg-oro/10 p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-oro font-semibold">
            <Trophy className="size-3.5" />
            <span>Líder de Ventas</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-sans text-oro truncate">
            {topVolunteer?.name || "-"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
            {topVolunteer ? `${formatARS(topVolunteer.totalAmount)} (${topVolunteer.ticketsCount} tickets)` : ""}
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-card p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Target className="size-3.5 text-primary" />
            <span>Voluntarios Activos</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-sans text-foreground tabular-nums">
            {rankings.length} canales
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Con ventas registradas
          </div>
        </div>
      </div>

      {/* Podio visual para los top 3 */}
      {podium}

      {/* Tabla completa de voluntarios */}
      <Card className="border-border/80 bg-card shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <TrendingUp className="size-4 text-primary" />
            Tabla General de Desempeño por Voluntario y Canal Comercial ({rankings.length})
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <TableRow>
                <TableHead className="w-[80px]">Posición</TableHead>
                <TableHead>Voluntario / Referente</TableHead>
                <TableHead className="text-center w-[110px]">Órdenes</TableHead>
                <TableHead className="text-center w-[120px]">Entradas</TableHead>
                <TableHead className="text-right w-[140px]">Ticket Prom.</TableHead>
                <TableHead className="text-center w-[110px]">Aporte %</TableHead>
                <TableHead className="text-right w-[160px]">Recaudación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {paginatedRankings.map((vol, index) => {
                const actualIndex = (safeCurrentPage - 1) * pageSize + index;
                return (
                  <TableRow key={vol.name} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{getRankBadge(actualIndex)}</TableCell>
                    <TableCell className="font-semibold text-foreground">{vol.name}</TableCell>
                    <TableCell className="text-center text-muted-foreground font-mono tabular-nums">{vol.salesCount}</TableCell>
                    <TableCell className="text-center font-bold font-sans text-foreground tabular-nums">
                      {vol.ticketsCount}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {formatARS(vol.averageTicketAmount)}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-pampa tabular-nums">
                      {vol.revenueShare}%
                    </TableCell>
                    <TableCell className="text-right font-bold font-sans text-primary tabular-nums">
                      {formatARS(vol.totalAmount)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <TablePagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={rankings.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          itemName="voluntarios"
        />
      </Card>
    </div>
  );
}
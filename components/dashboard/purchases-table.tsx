"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Heart,
  Users,
  CreditCard,
  XCircle,
  RotateCcw,
  DollarSign,
  Receipt,
} from "lucide-react";
import { DashboardPurchase, PurchaseStatus } from "@/lib/dashboard/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SearchInput,
  SegmentedControl,
  FilterSelect,
  SegmentOption,
} from "./table-controls";
import { formatARS } from "@/lib/dashboard/format";
import { TablePagination } from "./table-pagination";

interface PurchasesTableProps {
  purchases: DashboardPurchase[];
}

type StatusFilter = PurchaseStatus | "all";

const PARTICIPATION_OPTIONS = [
  { value: "all", label: "Todas las modalidades" },
  { value: "asistir", label: "Asistir al evento" },
  { value: "donacion", label: "Donación pura" },
];

const DEFAULT_PAGE_SIZE = 10;

export function PurchasesTable({ purchases }: PurchasesTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [participationFilter, setParticipationFilter] = useState<string>("all");
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

  const handleParticipationChange = (val: string) => {
    setParticipationFilter(val);
    setCurrentPage(1);
  };

  const paidPurchases = purchases.filter((p) => p.status === "paid");
  const pendingPurchases = purchases.filter((p) => p.status === "pending");
  const cancelledPurchases = purchases.filter((p) => p.status === "cancelled");
  const refundedPurchases = purchases.filter((p) => p.status === "refunded");

  const totalPaidRevenue = paidPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalPendingRevenue = pendingPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const donationPurchases = paidPurchases.filter((p) => p.buyerParticipation === "donacion");
  const totalDonationRevenue = donationPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const avgTicket = paidPurchases.length > 0 ? Math.round(totalPaidRevenue / paidPurchases.length) : 0;

  const statusOptions: SegmentOption<StatusFilter>[] = [
    { value: "all", label: "Todos", count: purchases.length },
    {
      value: "paid",
      label: "Pagados",
      count: paidPurchases.length,
      activeClassName: "bg-pampa text-white",
    },
    {
      value: "pending",
      label: "Pendientes",
      count: pendingPurchases.length,
      activeClassName: "bg-oro text-white font-bold",
    },
    {
      value: "cancelled",
      label: "Cancelados",
      count: cancelledPurchases.length,
      activeClassName: "bg-foreground text-background",
    },
    {
      value: "refunded",
      label: "Reembolsados",
      count: refundedPurchases.length,
      activeClassName: "bg-vino text-white",
    },
  ];

  const filteredPurchases = purchases.filter((p) => {
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.buyerName.toLowerCase().includes(term) ||
      p.buyerEmail.toLowerCase().includes(term) ||
      (p.buyerDni && p.buyerDni.includes(term)) ||
      (p.referringVolunteer && p.referringVolunteer.toLowerCase().includes(term)) ||
      (p.mpPaymentId && p.mpPaymentId.toLowerCase().includes(term));

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesPart =
      participationFilter === "all" || p.buyerParticipation === participationFilter;

    return matchesSearch && matchesStatus && matchesPart;
  });

  const totalPages = Math.ceil(filteredPurchases.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedPurchases = filteredPurchases.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  return (
    <div className="space-y-4">
      {/* Franja Informativa de Finanzas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-pampa/40 bg-pampa/10 p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-pampa font-semibold">
            <DollarSign className="size-3.5" />
            <span>Recaudación Aprobada</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-sans text-pampa tabular-nums">
            {formatARS(totalPaidRevenue)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {paidPurchases.length} órdenes liquidadas
          </div>
        </div>

        <div className="rounded-lg border border-oro/40 bg-oro/10 p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-oro font-semibold">
            <Clock className="size-3.5" />
            <span>Pendiente de Pago</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-sans text-oro tabular-nums">
            {formatARS(totalPendingRevenue)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {pendingPurchases.length} órdenes en proceso
          </div>
        </div>

        <div className="rounded-lg border border-vino/40 bg-vino/10 p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-vino font-semibold">
            <Heart className="size-3.5" />
            <span>Donaciones Puras</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-sans text-vino tabular-nums">
            {formatARS(totalDonationRevenue)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {donationPurchases.length} donaciones comunitarias
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-card p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Receipt className="size-3.5 text-primary" />
            <span>Ticket Promedio</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-sans text-foreground tabular-nums">
            {formatARS(avgTicket)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            por orden de compra
          </div>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          placeholder="Buscar por comprador, email, DNI, voluntario o MP ID..."
          value={search}
          onChange={handleSearchChange}
          className="w-full lg:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            ariaLabel="Filtrar por estado de pago"
            options={statusOptions}
            value={statusFilter}
            onChange={handleStatusChange}
          />
          <FilterSelect
            ariaLabel="Filtrar por tipo de compra"
            value={participationFilter}
            onChange={handleParticipationChange}
            options={PARTICIPATION_OPTIONS}
          />
        </div>
      </div>

      {/* Tabla de Finanzas */}
      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <TableRow>
                <TableHead className="w-[110px]">Fecha</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead className="w-[110px]">Categoría</TableHead>
                <TableHead className="w-[70px] text-center">Cant.</TableHead>
                <TableHead className="w-[130px] text-right">Monto Total</TableHead>
                <TableHead className="w-[130px]">Estado Pago</TableHead>
                <TableHead className="w-[130px]">Modalidad</TableHead>
                <TableHead>Voluntario / MP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {paginatedPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No se encontraron órdenes de compra con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPurchases.map((purchase) => (
                  <TableRow key={purchase.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                      {new Date(purchase.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}{" "}
                      {new Date(purchase.createdAt).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{purchase.buyerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {purchase.buyerEmail} {purchase.buyerDni ? `· DNI ${purchase.buyerDni}` : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-foreground">{purchase.tierName}</span>
                    </TableCell>
                    <TableCell className="text-center font-bold font-sans text-foreground tabular-nums">
                      {purchase.quantity}
                    </TableCell>
                    <TableCell className="text-right font-bold font-sans text-foreground tabular-nums">
                      {formatARS(purchase.totalAmount)}
                    </TableCell>
                    <TableCell>
                      {purchase.status === "paid" && (
                        <Badge variant="outline" className="border-pampa/60 bg-pampa/10 text-pampa gap-1 font-semibold">
                          <CheckCircle2 className="size-3" /> Aprobado
                        </Badge>
                      )}
                      {purchase.status === "pending" && (
                        <Badge variant="outline" className="border-oro/60 bg-oro/10 text-oro gap-1 font-semibold">
                          <Clock className="size-3" /> Pendiente
                        </Badge>
                      )}
                      {purchase.status === "cancelled" && (
                        <Badge variant="outline" className="border-border bg-muted text-muted-foreground gap-1 font-semibold">
                          <XCircle className="size-3" /> Cancelado
                        </Badge>
                      )}
                      {purchase.status === "refunded" && (
                        <Badge variant="outline" className="border-vino/50 bg-vino/10 text-vino gap-1 font-semibold">
                          <RotateCcw className="size-3" /> Reembolsado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {purchase.buyerParticipation === "donacion" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-vino">
                          <Heart className="size-3" /> Donación
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="size-3 text-pampa" /> Asistir
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">
                        {purchase.referringVolunteer || "Venta Directa"}
                      </div>
                      {purchase.mpPaymentId && (
                        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                          <CreditCard className="size-2.5" /> {purchase.mpPaymentId}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <TablePagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={filteredPurchases.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          itemName="transacciones"
        />
      </div>
    </div>
  );
}
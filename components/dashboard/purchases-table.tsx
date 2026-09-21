"use client";

import { useMemo, useState } from "react";
import { Search, CheckCircle2, Clock, Heart, Users, CreditCard } from "lucide-react";
import { DashboardPurchase } from "@/lib/dashboard/types";
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

interface PurchasesTableProps {
  purchases: DashboardPurchase[];
}

export function PurchasesTable({ purchases }: PurchasesTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [participationFilter, setParticipationFilter] = useState<string>("all");

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.buyerName.toLowerCase().includes(term) ||
        p.buyerEmail.toLowerCase().includes(term) ||
        (p.buyerDni && p.buyerDni.includes(term)) ||
        (p.referringVolunteer && p.referringVolunteer.toLowerCase().includes(term)) ||
        (p.mpPaymentId && p.mpPaymentId.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;

      const matchesPart =
        participationFilter === "all" || p.buyerParticipation === participationFilter;

      return matchesSearch && matchesStatus && matchesPart;
    });
  }, [purchases, search, statusFilter, participationFilter]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-4">
      {/* Controles de búsqueda y filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por comprador, email, DNI, voluntario o MP ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/80 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro estado pago */}
          <div className="flex rounded-md border border-border/80 bg-card p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos ({purchases.length})
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                statusFilter === "paid"
                  ? "bg-pampa text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pagados ({purchases.filter((p) => p.status === "paid").length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                statusFilter === "pending"
                  ? "bg-oro text-amber-950 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pendientes ({purchases.filter((p) => p.status === "pending").length})
            </button>
          </div>

          {/* Filtro modalidad */}
          <select
            value={participationFilter}
            onChange={(e) => setParticipationFilter(e.target.value)}
            aria-label="Filtrar por tipo de compra"
            className="h-8 rounded-md border border-border/80 bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Todas las modalidades</option>
            <option value="asistir">Asistir al evento</option>
            <option value="donacion">Donación pura</option>
          </select>
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
                <TableHead className="w-[100px]">Tipo</TableHead>
                <TableHead className="w-[80px] text-center">Cant.</TableHead>
                <TableHead className="w-[120px] text-right">Monto Total</TableHead>
                <TableHead className="w-[120px]">Estado Pago</TableHead>
                <TableHead className="w-[130px]">Modalidad</TableHead>
                <TableHead>Voluntario / MP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No se encontraron órdenes de compra con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
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
                      <span className="text-xs font-medium text-foreground">{purchase.tierName}</span>
                    </TableCell>
                    <TableCell className="text-center font-semibold text-foreground">
                      {purchase.quantity}
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {formatCurrency(purchase.totalAmount)}
                    </TableCell>
                    <TableCell>
                      {purchase.status === "paid" ? (
                        <Badge variant="outline" className="border-pampa/60 bg-pampa/10 text-pampa gap-1 font-medium">
                          <CheckCircle2 className="size-3" /> Aprobado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 gap-1 font-medium">
                          <Clock className="size-3" /> Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {purchase.buyerParticipation === "donacion" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-vino">
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
                        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
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
      </div>
    </div>
  );
}

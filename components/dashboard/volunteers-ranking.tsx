import { Trophy, Award, Medal, TrendingUp } from "lucide-react";
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

interface VolunteersRankingProps {
  rankings: VolunteerRanking[];
}

export function VolunteersRanking({ rankings }: VolunteersRankingProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-oro text-amber-950 font-bold text-xs shadow-xs">
          1°
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100 font-bold text-xs">
          2°
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-amber-700 text-white font-bold text-xs">
          3°
        </span>
      );
    }
    return (
      <span className="text-xs text-muted-foreground font-semibold px-1.5">
        {index + 1}°
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Podio visual para los top 3 */}
      {rankings.length >= 2 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {rankings.slice(0, 3).map((v, idx) => (
            <Card
              key={v.name}
              className={`border-border/80 bg-card shadow-sm relative overflow-hidden ${
                idx === 0 ? "ring-2 ring-oro/50" : ""
              }`}
            >
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-oro px-3 py-0.5 text-[10px] font-bold text-amber-950 uppercase tracking-wider rounded-bl-lg">
                  Líder de ventas
                </div>
              )}
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                  {idx === 0 && <Trophy className="size-4 text-oro" />}
                  {idx === 1 && <Award className="size-4 text-slate-400" />}
                  {idx === 2 && <Medal className="size-4 text-amber-700" />}
                  Puesto #{idx + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold font-display text-foreground">{v.name}</div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(v.totalAmount)}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {v.ticketsCount} entradas ({v.salesCount} compras)
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabla completa de voluntarios */}
      <Card className="border-border/80 bg-card shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Tabla General de Desempeño por Voluntario / Canal
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <TableRow>
                <TableHead className="w-[80px]">Posición</TableHead>
                <TableHead>Voluntario / Referente</TableHead>
                <TableHead className="text-center w-[120px]">Órdenes</TableHead>
                <TableHead className="text-center w-[130px]">Entradas Totales</TableHead>
                <TableHead className="text-right w-[160px]">Recaudación Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {rankings.map((vol, index) => (
                <TableRow key={vol.name} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{getRankBadge(index)}</TableCell>
                  <TableCell className="font-semibold text-foreground">{vol.name}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{vol.salesCount}</TableCell>
                  <TableCell className="text-center font-bold text-foreground">
                    {vol.ticketsCount}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {formatCurrency(vol.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

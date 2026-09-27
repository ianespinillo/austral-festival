import { Sparkles, Leaf, Fish } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TicketDiet } from "@/lib/dashboard/types";

interface DietBadgeProps {
  diet: TicketDiet;
}

/**
 * Familia única de badges de dieta, sólidos con los acentos de marca
 * (pampa/oro/cielo). Compartida por tickets-table y catering-summary.
 */
export function DietBadge({ diet }: DietBadgeProps) {
  switch (diet) {
    case "celiaco":
      return (
        <Badge className="bg-oro text-amber-950 font-bold">
          <Sparkles /> Celíaco
        </Badge>
      );
    case "vegetariano":
      return (
        <Badge className="bg-pampa text-white font-semibold">
          <Leaf /> Vegetariano
        </Badge>
      );
    case "sin_carne_viernes":
      return (
        <Badge className="bg-cielo text-sky-950 font-semibold">
          <Fish /> Sin carne vier.
        </Badge>
      );
    default:
      return <span className="text-xs text-muted-foreground">Regular</span>;
  }
}
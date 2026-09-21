import { Metadata } from "next";
import { getDashboardData } from "@/lib/dashboard/service";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Operativo y Financiero · Peña Folklórica Austral",
  description:
    "Panel de control operativo, finanzas, acreditaciones en puerta y catering para el equipo organizador de la peña.",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardClient initialData={data} />;
}

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/dashboard/service";
import { isStaffAuthed } from "@/lib/staff";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Operativo y Financiero · Peña Folklórica Austral",
  description:
    "Panel de control operativo, finanzas, acreditaciones en puerta y catering para el equipo organizador de la peña.",
};

export default async function DashboardPage() {
  if (!(await isStaffAuthed())) redirect("/validar");

  const data = await getDashboardData();

  return <DashboardClient initialData={data} />;
}

import { DashboardPurchase, DashboardTicket } from "./types";

function sanitizeCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportTicketsToCSV(tickets: DashboardTicket[], filename = "asistentes_puerta_peña.csv") {
  const headers = [
    "Código Entrada",
    "Nombre y Apellido",
    "DNI",
    "Mayor de Edad (+18)",
    "Dieta",
    "Estado",
    "Fecha/Hora Ingreso",
    "Límite Bebidas",
    "Bebidas Con Alcohol",
    "Bebidas Sin Alcohol",
    "Tipo de Entrada",
    "Comprador",
    "Email Comprador",
    "Voluntario Referente",
  ];

  const rows = tickets.map((t) => [
    sanitizeCell(t.qrCode),
    sanitizeCell(t.holderName),
    sanitizeCell(t.holderDni),
    sanitizeCell(t.isAdult ? "Sí (+18)" : "No (Menor)"),
    sanitizeCell(t.diet),
    sanitizeCell(t.status === "used" ? "Ingresó" : t.status === "active" ? "Activa (No ingresó)" : "Cancelada"),
    sanitizeCell(t.checkedInAt ? new Date(t.checkedInAt).toLocaleString("es-AR") : "Pendiente"),
    sanitizeCell(t.alcoholAllowance),
    sanitizeCell(t.alcoholicDrinksServed),
    sanitizeCell(t.nonAlcoholicDrinksServed),
    sanitizeCell(t.tierName),
    sanitizeCell(t.buyerName),
    sanitizeCell(t.buyerEmail),
    sanitizeCell(t.referringVolunteer || "Venta Directa"),
  ]);

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
  downloadCSV(csvContent, filename);
}

export function exportPurchasesToCSV(purchases: DashboardPurchase[], filename = "ventas_finanzas_peña.csv") {
  const headers = [
    "ID Transacción",
    "Fecha",
    "Comprador",
    "DNI Comprador",
    "Email",
    "Tipo de Entrada",
    "Cantidad",
    "Monto Total ($)",
    "Estado de Pago",
    "ID MercadoPago",
    "Tipo Participación",
    "Voluntario Referente",
  ];

  const rows = purchases.map((p) => [
    sanitizeCell(p.id),
    sanitizeCell(new Date(p.createdAt).toLocaleString("es-AR")),
    sanitizeCell(p.buyerName),
    sanitizeCell(p.buyerDni || "-"),
    sanitizeCell(p.buyerEmail),
    sanitizeCell(p.tierName),
    sanitizeCell(p.quantity),
    sanitizeCell(p.totalAmount),
    sanitizeCell(p.status === "paid" ? "Aprobado (Pagado)" : p.status === "pending" ? "Pendiente" : p.status),
    sanitizeCell(p.mpPaymentId || "-"),
    sanitizeCell(p.buyerParticipation === "donacion" ? "Donación Comunitaria" : "Asistencia"),
    sanitizeCell(p.referringVolunteer || "Venta Directa"),
  ]);

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
  downloadCSV(csvContent, filename);
}

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

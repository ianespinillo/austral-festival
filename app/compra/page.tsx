import { redirect } from "next/navigation";

// Destino de las back_urls `failure` y `pending` de Mercado Pago.
export default async function CompraPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  if (params.pendiente) {
    const forwarded = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "pendiente" || typeof value !== "string") continue;
      forwarded.set(key, value);
    }
    if (!forwarded.has("status")) forwarded.set("status", "pending");
    redirect(`/compra/exito?${forwarded.toString()}`);
  }

  // Pago cancelado o rechazado: volver al formulario con los datos cargados
  redirect("/?pago=cancelado#entradas");
}

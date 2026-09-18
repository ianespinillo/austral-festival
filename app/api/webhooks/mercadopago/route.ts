import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import { getPaymentById, getMerchantOrderById } from "@/lib/mercadopago";
import { claimAndFulfill } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";

interface WebhookBody {
  type?: string;
  topic?: string;
  action?: string;
  resource?: string;
  data?: { id?: string | number };
  id?: string | number;
}

/**
 * MP manda el mismo evento en varios formatos según el momento y la
 * configuración del panel:
 *  - IPN viejo: query string `?id=...&topic=merchant_order|payment` (a veces
 *    también en el body como `{ resource, topic }`, donde `resource` es una
 *    URL completa para merchant_order y un id pelado para payment).
 *  - Webhook nuevo: body `{ type: "payment", data: { id } }`.
 * Esta función normaliza cualquiera de esos formatos a un id + type.
 */
function extractContext(
  request: Request,
  body: WebhookBody
): { id: string | null; type?: string } {
  const url = new URL(request.url);
  const resource = typeof body.resource === "string" ? body.resource : undefined;
  const fromResource = resource?.split("?")[0].split("/").filter(Boolean).pop();

  const rawId =
    body.data?.id ??
    url.searchParams.get("data.id") ??
    fromResource ??
    url.searchParams.get("id") ??
    body.id;

  const rawType =
    body.type ??
    body.topic ??
    url.searchParams.get("type") ??
    url.searchParams.get("topic") ??
    undefined;

  const type =
    rawType === "merchant_order" || resource?.includes("/merchant_orders/")
      ? "merchant_order"
      : rawType;

  return { id: rawId ? String(rawId) : null, type };
}

function webhookIsValid(request: Request, resourceId: string): boolean {
  const signatureHeader = request.headers.get("x-signature") ?? "";
  const ts = signatureHeader.match(/ts=([^,\s]+)/)?.[1] ?? "";
  const signature = signatureHeader.match(/v1=([^,\s]+)/)?.[1] ?? "";

  // MP solo envía `x-signature` si configuraste el secreto en el panel.
  // Si no viene firma, se procesa igual (comportamiento histórico de esta integración).
  if (!ts || !signature) {
    console.warn("[webhook] request sin firma (sin x-signature): se procesa igual");
    return true;
  }

  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[webhook] MP_WEBHOOK_SECRET sin configurar: no se puede verificar la firma");
    return true;
  }

  try {
    const requestId = request.headers.get("x-request-id");
    // Si no viene x-request-id, MP omite ese segmento del manifest entero
    // (no se manda "request-id:;").
    const manifest = `id:${resourceId.toLowerCase()};${
      requestId ? `request-id:${requestId};` : ""
    }ts:${ts};`;
    const hash = createHmac("sha256", secret).update(manifest).digest("hex");
    const valid = hash === signature;
    if (!valid) {
      console.warn("[webhook] firma no coincide, se procesa igual", { manifest, ts });
    }
    // Nunca se falla cerrado: se sigue procesando igual, pero queda logueado
    // para poder diagnosticar un secreto desincronizado con el panel de MP.
    return true;
  } catch (error) {
    console.warn("[webhook] error validando firma, se procesa igual", error);
    return true;
  }
}

type ResolvedPayment = {
  paymentId: string;
  payment: PaymentResponse;
  externalRef: string;
};

async function resolvePayment(
  contextId: string,
  bodyType?: string
): Promise<ResolvedPayment | null> {
  // Checkout Pro envía webhooks `merchant_order`: data.id es el id de la
  // merchant order (que agrupa uno o más pagos), no del pago en sí.
  if (bodyType === "merchant_order") {
    const order = await getMerchantOrderById(contextId);
    const approved = order.payments?.find((p) => p.status === "approved");
    if (!approved) {
      console.log("[webhook] merchant_order sin pagos aprobados", {
        orderId: contextId,
        orderStatus: order.order_status,
        payments: order.payments?.map((p) => ({ id: p.id, status: p.status })),
      });
      return null;
    }
    const payment = await getPaymentById(String(approved.id));
    if (!payment || payment.status !== "approved") {
      console.log("[webhook] merchant_order resolvió un pago no approved", {
        orderId: contextId,
        paymentId: approved.id,
        paymentStatus: payment?.status,
      });
      return null;
    }
    const externalRef = order.external_reference ?? payment.external_reference ?? "";
    if (!externalRef) {
      console.warn("[webhook] merchant_order sin external_reference", {
        orderId: contextId,
        paymentId: approved.id,
      });
      return null;
    }
    return { paymentId: String(approved.id), payment, externalRef };
  }

  // Webhook `payment`: data.id es el id del pago directamente.
  const payment = await getPaymentById(contextId);
  const externalRef = payment.external_reference ?? "";
  if (payment.status !== "approved" || !externalRef) {
    console.log("[webhook] pago no apto para fulfill", {
      paymentId: contextId,
      paymentStatus: payment.status,
      hasExternalRef: externalRef !== "",
    });
    return null;
  }
  return { paymentId: contextId, payment, externalRef };
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    let body: WebhookBody = {};
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        // Algunos IPN viejos llegan sin body (todo en el query string).
        body = {};
      }
    }

    console.log("[webhook] received", body, "query:", request.url);

    const { id: contextId, type } = extractContext(request, body);
    if (!contextId) {
      console.warn("[webhook] evento sin id utilizable, se ignora", body);
      return NextResponse.json({ received: true });
    }

    // Nunca falla cerrado por firma inválida/ausente: solo se loguea.
    // resolvePayment siempre re-fetchea contra la API de MP y valida
    // approved + purchase existente antes de tocar nada, así que un id
    // forjado no puede fulfillar una compra que no exista o no esté paga.
    webhookIsValid(request, contextId);

    let resolved: ResolvedPayment | null = null;
    try {
      resolved = await resolvePayment(contextId, type);
    } catch (error) {
      console.error("[webhook] no se pudo resolver el pago/orden", {
        contextId,
        type,
        error,
      });
    }
    if (!resolved) {
      console.log("[webhook] evento sin resolución, se ignora", { contextId, type });
      return NextResponse.json({ received: true });
    }

    const result = await claimAndFulfill(
      resolved.externalRef,
      resolved.paymentId,
      resolved.payment
    );

    if (result.alreadyHandled) {
      return NextResponse.json({ received: true, alreadyHandled: true });
    }
    if (!result.ok && result.reason === "purchase_not_found") {
      console.warn("[webhook] external_reference no corresponde a una purchase", {
        externalRef: resolved.externalRef,
      });
      return NextResponse.json({ error: "purchase_not_found" }, { status: 404 });
    }

    return NextResponse.json({
      fulfilled: result.ok,
      tickets: result.tickets,
      reason: result.reason,
    });
  } catch (error) {
    console.error("[webhook] error", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
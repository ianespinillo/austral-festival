import { Ticket } from "@prisma/client";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import { prisma } from "@/lib/prisma";
import { generateTicketCode, generateTicketQr } from "@/lib/qr";
import { sendEmail } from "@/lib/email";
import { isLegalAge, ageAsOf } from "@/lib/age";
import { dietLabel } from "@/lib/diet";
import { DEFAULT_ALCOHOL_ALLOWANCE, VENUE_MAPS_URL } from "@/lib/config";

export async function fulfillPurchase(purchaseId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { tier: { include: { event: true } } },
  });

  if (!purchase) return { fulfilled: false, reason: "purchase_not_found" };
  if (purchase.status !== "paid") return { fulfilled: false, reason: `status_${purchase.status}` };

  const isDonation = purchase.buyerParticipation === "donacion";
  if (isDonation) {
    await sendDonationReceipt(purchase);
    return { fulfilled: true, tickets: [] };
  }

  const ticketsToGenerate = purchase.quantity * (purchase.tier.ticketCount ?? 1);

  type GuestRecord = {
    name: string;
    dni: string;
    birthDate: string | null;
    alcoholAllowance: number;
    diet: string;
  };

  const guests: GuestRecord[] = Array.isArray(purchase.guests)
    ? (purchase.guests as GuestRecord[])
    : [];

  const payloads = [];
  for (let i = 0; i < ticketsToGenerate; i++) {
    const guest = guests[i];
    const guestName =
      guest?.name ??
      (ticketsToGenerate > 1
        ? `${purchase.buyerName} (${i + 1}/${ticketsToGenerate})`
        : purchase.buyerName);
    const guestDni = guest?.dni ?? purchase.buyerDni ?? "";

    const birthDate = guest?.birthDate ? new Date(guest.birthDate) : null;
    const alcoholAllowance =
      typeof guest?.alcoholAllowance === "number"
        ? guest.alcoholAllowance
        : birthDate
          ? isLegalAge(birthDate, new Date(purchase.createdAt))
            ? DEFAULT_ALCOHOL_ALLOWANCE
            : 0
          : DEFAULT_ALCOHOL_ALLOWANCE;
    const diet =
      typeof guest?.diet === "string" && guest.diet.trim() !== ""
        ? guest.diet
        : "regular";

    payloads.push({
      purchaseId: purchase.id,
      tierId: purchase.tierId,
      qrCode: `TICKET-${generateTicketCode()}`,
      holderName: guestName,
      holderDni: guestDni,
      holderBirthDate: birthDate,
      alcoholAllowance,
      diet,
    });
  }

  const created = (await prisma.$transaction([
    ...payloads.map((p) => prisma.ticket.create({ data: p })),
    prisma.ticketTier.update({
      where: { id: purchase.tierId },
      data: { soldCount: { increment: ticketsToGenerate } },
    }),
  ])) as Ticket[];

  const tickets = created.slice(0, payloads.length);
  const qrBuffers: { filename: string; content: Buffer; contentType: string }[] = [];
  for (const ticket of tickets) {
    const qr = await generateTicketQr(ticket.id);
    qrBuffers.push({
      filename: `entrada-${ticket.qrCode.replace("TICKET-", "")}.png`,
      content: qr,
      contentType: "image/png",
    });
  }

  const event = purchase.tier.event;
  const eventDate = new Date(event.date).toLocaleString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const attendeeRows = tickets
    .map((t) => {
      const ageInfo = t.holderBirthDate
        ? `${ageAsOf(t.holderBirthDate, new Date())} años`
        : "";
      return `
        <div class="ticket">
          <p><strong>${t.holderName}</strong> — DNI: ${t.holderDni}</p>
          ${ageInfo ? `<p>${ageInfo}</p>` : ""}
          <p>Menú: ${dietLabel(t.diet)}</p>
          <p class="code">${t.qrCode}</p>
          <p>${t.alcoholAllowance > 0 ? `${t.alcoholAllowance} bebidas alcohólicas incluidas` : "Sin bebidas alcohólicas (menor de edad)"}</p>
        </div>`;
    })
    .join("");

  const hasMinors = tickets.some((t) => t.alcoholAllowance === 0);

  try {
    await sendEmail({
      to: purchase.buyerEmail,
      subject: `Tus entradas — ${event.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background: #faf8f5; margin: 0; padding: 24px; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
            .header { background: #1c1917; color: #fafaf9; padding: 28px; text-align: center; }
            .header h1 { margin: 0 0 4px; font-size: 22px; }
            .header p { margin: 0; opacity: 0.75; }
            .body { padding: 28px; color: #1c1917; }
            .ticket { background: #f5f5f4; border-radius: 10px; padding: 16px; margin: 12px 0; border: 1px solid #e7e5e4; }
            .ticket p { margin: 4px 0; }
            .code { font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #1c1917; }
            .minor-note { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin: 14px 0; font-size: 13px; color: #92400e; }
            .info-box { background: #EAF0F6; border: 1px solid #4FA3D1; border-radius: 8px; padding: 12px; margin: 14px 0; font-size: 13px; color: #0E4A63; }
            .footer { text-align: center; padding: 18px; color: #78716c; font-size: 12px; border-top: 1px solid #e7e5e4; }
            ul { padding-left: 20px; }
            li { margin: 6px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${event.name}</h1>
              <p>Tu compra fue confirmada</p>
            </div>
            <div class="body">
              <p>Hola <strong>${purchase.buyerName}</strong>,</p>
              <p>Te adjuntamos <strong>${purchase.quantity} entrada(s)</strong> tipo <strong>${purchase.tier.name}</strong>.</p>
              <div class="ticket">
                <p><strong>Fecha:</strong> ${eventDate}</p>
                <p><strong>Lugar:</strong> <a href="${VENUE_MAPS_URL}" style="color:#0E4A63">${event.venue}</a></p>
                <p><strong>Horario:</strong> Apertura 20:00 hs · Cierre 22:00 hs</p>
                <p><strong>Monto pagado:</strong> $${purchase.totalAmount.toLocaleString("es-AR")}</p>
              </div>
              <h3 style="margin-top:24px">Asistentes</h3>
              ${attendeeRows}
              ${hasMinors ? `<div class="minor-note"><strong>Menores de edad:</strong> Las personas menores de 18 años no tendrán acceso a bebidas alcohólicas en la peña.</div>` : ""}
              <h3 style="margin-top:24px">Cómo usar tu entrada</h3>
              <ul>
                <li>Presentá el <strong>código QR</strong> adjunto (o tu <strong>DNI</strong>) en la entrada del evento.</li>
                <li>Cada entrada tiene su propio QR y corresponde a un asistente.</li>
                <li>Cada mayor de 18 años puede consumir hasta 3 bebidas alcohólicas incluidas.</li>
                <li>No está permitida la venta ni el consumo de bebidas alcohólicas a menores de edad.</li>
              </ul>
              <p>¡Te esperamos!</p>
            </div>
            <div class="footer">Peña Folklórica · Universidad Austral</div>
          </div>
        </body>
        </html>
      `,
      attachments: qrBuffers,
    });
  } catch (error) {
    console.error("[fulfillment] email failed", error);
  }

  return {
    fulfilled: true,
    tickets: tickets.map((t) => t.qrCode),
  };
}

async function sendDonationReceipt(purchase: {
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  totalAmount: number;
  referringVolunteer: string | null;
  tier: { name: string; event: { name: string; date: Date; venue: string } };
}) {
  const event = purchase.tier.event;
  const eventDate = new Date(event.date).toLocaleString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  try {
    await sendEmail({
      to: purchase.buyerEmail,
      subject: `Comprobante de donación — ${event.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background: #faf8f5; margin: 0; padding: 24px; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
            .header { background: #1c1917; color: #fafaf9; padding: 28px; text-align: center; }
            .header h1 { margin: 0 0 4px; font-size: 22px; }
            .header p { margin: 0; opacity: 0.75; }
            .body { padding: 28px; color: #1c1917; }
            .ticket { background: #f5f5f4; border-radius: 10px; padding: 16px; margin: 12px 0; border: 1px solid #e7e5e4; }
            .ticket p { margin: 4px 0; }
            .info-box { background: #EAF0F6; border: 1px solid #4FA3D1; border-radius: 8px; padding: 12px; margin: 14px 0; font-size: 13px; color: #0E4A63; }
            .footer { text-align: center; padding: 18px; color: #78716c; font-size: 12px; border-top: 1px solid #e7e5e4; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${event.name}</h1>
              <p>Tu donación fue registrada</p>
            </div>
            <div class="body">
              <p>Hola <strong>${purchase.buyerName}</strong>,</p>
              <p><strong>Donaste ${purchase.quantity} entrada(s)</strong> para que la organización las entregue a quienes no puedan costearlas.</p>
              <div class="ticket">
                <p><strong>Fecha del evento:</strong> ${eventDate}</p>
                <p><strong>Lugar:</strong> <a href="${VENUE_MAPS_URL}" style="color:#0E4A63">${event.venue}</a></p>
                <p><strong>Horario:</strong> Apertura 20:00 hs · Cierre 22:00 hs</p>
                <p><strong>Monto donado:</strong> $${purchase.totalAmount.toLocaleString("es-AR")}</p>
              </div>
              <div class="info-box">
                <strong>Este es tu comprobante de donación.</strong> Las entradas donadas quedan a cargo de la organización y serán entregadas por ella. No recibís códigos QR por esta donación.
              </div>
              ${purchase.referringVolunteer ? `<p>Viene de parte de <strong>${purchase.referringVolunteer}</strong>.</p>` : ""}
              <p>¡Gracias por apoyar la peña!</p>
            </div>
            <div class="footer">Peña Folklórica · Universidad Austral</div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("[fulfillment] donation receipt email failed", error);
  }
}

export type ClaimResult = {
  ok: boolean;
  reason?: string;
  alreadyHandled?: boolean;
  fulfilled?: boolean;
  tickets?: string[];
};

export async function claimAndFulfill(
  externalRef: string,
  paymentId: string,
  payment?: PaymentResponse
): Promise<ClaimResult> {
  const purchase = await prisma.purchase.findUnique({
    where: { id: externalRef },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      buyerEmail: true,
    },
  });
  if (!purchase) {
    console.warn("[fulfillment] purchase no encontrada", { externalRef });
    return { ok: false, reason: "purchase_not_found" };
  }

  if (payment) {
    const paidAmount = payment.transaction_amount;
    if (typeof paidAmount === "number" && paidAmount !== purchase.totalAmount) {
      console.warn("[fulfillment] monto difiere, se continúa igual", {
        paymentId,
        paidAmount,
        expectedAmount: purchase.totalAmount,
      });
    }
    const payerEmail = payment.payer?.email?.toLowerCase();
    const isSandbox = (process.env.MP_ACCESS_TOKEN ?? "").startsWith("TEST-");
    if (!isSandbox && payerEmail && payerEmail !== purchase.buyerEmail.toLowerCase()) {
      console.warn("[fulfillment] email del pagador difiere, se continúa igual", {
        paymentId,
        payerEmail,
        expectedEmail: purchase.buyerEmail,
      });
    }
  }

  const claimed = await prisma.purchase.updateMany({
    where: {
      id: purchase.id,
      status: "pending",
      OR: [{ mpPaymentId: null }, { mpPaymentId: { isSet: false } }],
    },
    data: { status: "paid", mpPaymentId: paymentId },
  });
  if (claimed.count === 0) {
    console.log("[fulfillment] ya procesada o no pending", { externalRef, paymentId });
    return { ok: true, alreadyHandled: true };
  }

  try {
    const result = await fulfillPurchase(purchase.id);
    console.log("[fulfillment] compra completada", {
      externalRef,
      paymentId,
      tickets: result.fulfilled ? result.tickets : [],
    });
    return {
      ok: result.fulfilled,
      fulfilled: result.fulfilled,
      tickets: result.fulfilled ? result.tickets : undefined,
      reason: result.fulfilled ? undefined : result.reason,
    };
  } catch (error) {
    console.error("[fulfillment] falló la emisión, se revierte el claim", {
      externalRef,
      paymentId,
    }, error);
    await prisma.purchase
      .update({
        where: { id: purchase.id },
        data: { status: "pending", mpPaymentId: null },
      })
      .catch(() => {});
    throw error;
  }
}
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createPreference, getPaymentById, searchPaymentsByExternalReference } from "@/lib/mercadopago";
import { claimAndFulfill } from "@/lib/fulfillment";
import { isLegalAge, ageAsOf } from "@/lib/age";
import { VALID_DIET_VALUES } from "@/lib/diet";
import { DEFAULT_ALCOHOL_ALLOWANCE } from "@/lib/config";
import {
  isStaffAuthed,
  setStaffCookie,
  clearStaffCookie,
  requireStaff,
} from "@/lib/staff";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export interface ActionResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ---------- Compra ----------

export interface GuestInput {
  name: string;
  dni: string;
  birthDate: string;
  diet: string;
}

export async function createCheckoutPreference({
  tierId,
  quantity,
  buyerName,
  buyerEmail,
  participation,
  referringVolunteer,
  guests,
}: {
  tierId: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  participation?: "asistir" | "donacion";
  referringVolunteer?: string;
  guests: GuestInput[];
}): Promise<ActionResponse<{ initPoint: string; purchaseId: string }>> {
  try {
    const qty = Math.floor(Number(quantity));
    if (!qty || qty < 1 || qty > 6) {
      return { ok: false, error: "La cantidad debe ser entre 1 y 6 entradas." };
    }
    if (!buyerName || !buyerEmail) {
      return { ok: false, error: "Completá los datos del comprador." };
    }
    if (!/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(buyerEmail)) {
      return { ok: false, error: "El email no es válido." };
    }

    const isDonation = participation === "donacion";
    const parsedGuests: {
      name: string;
      dni: string;
      birthDate: string;
      alcoholAllowance: number;
      diet: string;
    }[] = [];

    if (isDonation) {
      if (Array.isArray(guests) && guests.length > 0) {
        for (const guest of guests) {
          const name = guest.name?.trim();
          const dni = guest.dni?.trim().replace(/\D/g, "");
          const birthDate = guest.birthDate ? new Date(guest.birthDate) : null;
          const diet = VALID_DIET_VALUES.has(guest.diet)
            ? guest.diet
            : "regular";
          if (!name || !dni || !birthDate || Number.isNaN(birthDate.getTime())) continue;
          parsedGuests.push({
            name,
            dni,
            birthDate: birthDate.toISOString(),
            alcoholAllowance: isLegalAge(birthDate, new Date())
              ? DEFAULT_ALCOHOL_ALLOWANCE
              : 0,
            diet,
          });
        }
      }
    } else {
      if (!Array.isArray(guests) || guests.length !== qty) {
        return {
          ok: false,
          error: "Completá el DNI y los datos de cada asistente.",
        };
      }

      const purchasedAt = new Date();
      const guestErrors: string[] = [];

      for (const guest of guests) {
        const name = guest.name?.trim();
        const dni = guest.dni?.trim().replace(/\D/g, "");
        const birthDate = guest.birthDate ? new Date(guest.birthDate) : null;
        const diet = VALID_DIET_VALUES.has(guest.diet)
          ? guest.diet
          : "regular";

        if (!name) {
          guestErrors.push("Falta el nombre de un asistente.");
          continue;
        }
        if (!dni || dni.length < 6 || dni.length > 10) {
          guestErrors.push(`El DNI de ${name} no es válido.`);
          continue;
        }
        if (!birthDate || Number.isNaN(birthDate.getTime())) {
          guestErrors.push(`Falta la fecha de nacimiento de ${name}.`);
          continue;
        }
        if (birthDate >= purchasedAt) {
          guestErrors.push(`La fecha de nacimiento de ${name} no es válida.`);
          continue;
        }
        parsedGuests.push({
          name,
          dni,
          birthDate: birthDate.toISOString(),
          alcoholAllowance: isLegalAge(birthDate, purchasedAt)
            ? DEFAULT_ALCOHOL_ALLOWANCE
            : 0,
          diet,
        });
      }

      if (guestErrors.length > 0) {
        return { ok: false, error: guestErrors[0] };
      }
    }

    const tier = await prisma.ticketTier.findUnique({ where: { id: tierId } });
    if (!tier || !tier.isActive) {
      return { ok: false, error: "La entrada seleccionada no está disponible." };
    }
    const available = tier.maxStock - tier.soldCount;
    if (available < qty) {
      return {
        ok: false,
        error: `Solo quedan ${available} entradas de este tipo.`,
      };
    }

    const totalAmount = tier.price * qty;
    const normalizedBuyerName = buyerName.trim();
    const normalizedBuyerEmail = buyerEmail.trim().toLowerCase();

    const purchase = await prisma.purchase.create({
      data: {
        tierId: tier.id,
        status: "pending",
        buyerName: normalizedBuyerName,
        buyerEmail: normalizedBuyerEmail,
        buyerDni: parsedGuests[0]?.dni ?? null,
        quantity: qty,
        totalAmount,
        guests: parsedGuests.length > 0 ? parsedGuests : null,
        buyerParticipation: isDonation ? "donacion" : "asistir",
        referringVolunteer: referringVolunteer?.trim() || null,
      },
    });

    const preference = await createPreference({
      items: [
        {
          title: `Entrada ${tier.name} — Peña Folk Austral`,
          quantity: qty,
          unitPrice: tier.price,
        },
      ],
      externalReference: purchase.id,
      buyer: { email: normalizedBuyerEmail, name: normalizedBuyerName },
      backUrls: {
        success: `${APP_URL}/compra/exito`,
        failure: `${APP_URL}/compra?fallo=1`,
        pending: `${APP_URL}/compra?pendiente=1`,
      },
      notificationUrl: `${APP_URL}/api/webhooks/mercadopago`,
    });

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { mpPreferenceId: String(preference.id) },
    });

    // ENTORNO TESTING (sandbox): redirigir al checkout de pruebas.
    const initPoint =
      preference.sandbox_init_point ?? preference.init_point;
    // ENTORNO PRODUCCION:
    // const initPoint = preference.init_point ?? preference.sandbox_init_point;
    if (!initPoint) {
      return { ok: false, error: "No se pudo iniciar el pago. Intentá de nuevo." };
    }

    return { ok: true, data: { initPoint, purchaseId: purchase.id } };
  } catch (error) {
    console.error("[createCheckoutPreference]", error);
    return { ok: false, error: "Ocurrió un error al iniciar el pago." };
  }
}

export async function reconcilePurchase(
  purchaseId: string,
  paymentId?: string | null
): Promise<ActionResponse<{ reconciled: boolean }>> {
  try {
    let payment = null;

    if (paymentId) {
      try {
        payment = await getPaymentById(String(paymentId));
      } catch {
        payment = null;
      }
    }

    if (!payment || payment.status !== "approved") {
      try {
        const matches = await searchPaymentsByExternalReference(purchaseId);
        const approved = matches.find((m) => m.status === "approved");
        if (approved) {
          payment = await getPaymentById(String(approved.id));
        }
      } catch {
        // Si falla el search, seguimos sin pago
      }
    }

    if (!payment || payment.status !== "approved") {
      return { ok: true, data: { reconciled: false } };
    }

    const result = await claimAndFulfill(purchaseId, String(payment.id), payment);
    const reconciled = !!(result.alreadyHandled || result.fulfilled);
    return { ok: true, data: { reconciled } };
  } catch (error) {
    console.error("[reconcilePurchase]", error);
    return { ok: false, error: "Error al confirmar el pago." };
  }
}

// ---------- Acceso del equipo ----------

export async function loginStaff(
  password: string
): Promise<ActionResponse> {
  const expected = process.env.STAFF_PASSWORD ?? "peña-demo";
  if (password !== expected) {
    return { ok: false, error: "Contraseña incorrecta." };
  }
  await setStaffCookie();
  revalidatePath("/validar");
  return { ok: true };
}

export async function logoutStaff(): Promise<ActionResponse> {
  await clearStaffCookie();
  revalidatePath("/validar");
  return { ok: true };
}

export async function isStaffLoggedIn(): Promise<
  ActionResponse<{ loggedIn: boolean }>
> {
  return { ok: true, data: { loggedIn: await isStaffAuthed() } };
}

// ---------- Consulta de entradas ----------

export async function lookupTicketByCode(
  code: string
): Promise<ActionResponse> {
  try {
    await requireStaff();
    const trimmed = code.trim();

    let ticketId: string | undefined;
    let qrCode: string | undefined;

    if (trimmed.startsWith("TICKET-") || /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(trimmed)) {
      qrCode = trimmed.startsWith("TICKET-")
        ? trimmed.toUpperCase()
        : `TICKET-${trimmed.toUpperCase()}`;
    } else {
      try {
        const parsed = JSON.parse(trimmed) as { ticketId?: string };
        ticketId = parsed.ticketId;
      } catch {
        ticketId = trimmed;
      }
    }

    const ticket = await prisma.ticket.findFirst({
      where: ticketId ? { id: ticketId } : { qrCode: qrCode ?? "" },
      include: {
        tier: { include: { event: true } },
        purchase: true,
        drinkRedemptions: { orderBy: { servedAt: "desc" } },
      },
    });
    if (!ticket) {
      return { ok: false, error: "Entrada no encontrada." };
    }
    return { ok: true, data: serializeTicket(ticket) };
  } catch (error) {
    return { ok: false, error: messageOf(error) };
  }
}

export async function lookupTicketsByDni(
  dni: string
): Promise<ActionResponse> {
  try {
    await requireStaff();
    const normalized = dni.trim();
    const tickets = await prisma.ticket.findMany({
      where: { holderDni: normalized },
      include: {
        tier: { include: { event: true } },
        purchase: true,
        drinkRedemptions: { orderBy: { servedAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    if (tickets.length === 0) {
      return { ok: false, error: "No se encontraron entradas con ese DNI." };
    }
    return { ok: true, data: tickets.map(serializeTicket) };
  } catch (error) {
    return { ok: false, error: messageOf(error) };
  }
}

// ---------- Check-in ----------

export async function checkInTicket(
  ticketId: string
): Promise<ActionResponse> {
  try {
    await requireStaff();
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return { ok: false, error: "Entrada no encontrada." };
    }
    if (ticket.status === "used") {
      return {
        ok: false,
        error: "Esta entrada ya fue utilizada para ingresar.",
      };
    }
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "used", checkedInAt: new Date() },
    });
    return { ok: true, data: { status: updated.status } };
  } catch (error) {
    return { ok: false, error: messageOf(error) };
  }
}

// ---------- Bebidas ----------

export async function serveDrink(
  ticketId: string,
  drinkType: "alcoholic" | "non_alcoholic"
): Promise<ActionResponse> {
  try {
    await requireStaff();
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return { ok: false, error: "Entrada no encontrada." };
    }
    if (ticket.status !== "used") {
      return {
        ok: false,
        error: "Primero se debe validar el ingreso de la persona.",
      };
    }

    const alcoholicServed = await prisma.drinkRedemption.count({
      where: { ticketId, drinkType: "alcoholic" },
    });

    if (
      drinkType === "alcoholic" &&
      alcoholicServed >= ticket.alcoholAllowance
    ) {
      return {
        ok: false,
        error: `Límite alcanzado: esta persona ya consumió ${ticket.alcoholAllowance} bebidas alcohólicas.`,
      };
    }

    const redemption = await prisma.drinkRedemption.create({
      data: { ticketId, drinkType },
    });

    return {
      ok: true,
      data: {
        redemptionId: redemption.id,
        alcoholicServed: drinkType === "alcoholic" ? alcoholicServed + 1 : alcoholicServed,
        maxAlcoholic: ticket.alcoholAllowance,
      },
    };
  } catch (error) {
    return { ok: false, error: messageOf(error) };
  }
}

export async function undoDrink(
  redemptionId: string
): Promise<ActionResponse> {
  try {
    await requireStaff();
    const redemption = await prisma.drinkRedemption.findUnique({
      where: { id: redemptionId },
    });
    if (!redemption) {
      return { ok: false, error: "Registro de bebida no encontrado." };
    }
    if (redemption.drinkType === "alcoholic") {
      const alcoholicCount = await prisma.drinkRedemption.count({
        where: { ticketId: redemption.ticketId, drinkType: "alcoholic" },
      });
      if (alcoholicCount <= 0) {
        return {
          ok: false,
          error: "No hay bebidas alcohólicas que deshacer.",
        };
      }
    }
    await prisma.drinkRedemption.delete({ where: { id: redemptionId } });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: messageOf(error) };
  }
}

// ---------- Helpers ----------

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado.";
}

function serializeTicket(ticket: {
  id: string;
  qrCode: string;
  status: string;
  holderName: string;
  holderDni: string;
  holderBirthDate: Date | null;
  alcoholAllowance: number;
  diet: string;
  checkedInAt: Date | null;
  createdAt: Date;
  tier: { name: string; price: number; event: { name: string; date: Date; venue: string } };
  purchase: { buyerName: string; buyerEmail: string };
  drinkRedemptions: { id: string; drinkType: string; servedAt: Date }[];
}) {
  const alcoholicServed = ticket.drinkRedemptions.filter(
    (d) => d.drinkType === "alcoholic"
  ).length;
  const nonAlcoholicServed = ticket.drinkRedemptions.filter(
    (d) => d.drinkType === "non_alcoholic"
  ).length;

  const birthDate = ticket.holderBirthDate;
  const age = birthDate ? ageAsOf(birthDate, new Date()) : null;

  return {
    id: ticket.id,
    qrCode: ticket.qrCode,
    status: ticket.status,
    holderName: ticket.holderName,
    holderDni: ticket.holderDni,
    holderBirthDate: birthDate?.toISOString() ?? null,
    holderAge: age,
    isLegalAge: age !== null ? age >= 18 : true,
    alcoholAllowance: ticket.alcoholAllowance,
    diet: ticket.diet,
    checkedInAt: ticket.checkedInAt,
    createdAt: ticket.createdAt,
    tierName: ticket.tier.name,
    tierPrice: ticket.tier.price,
    eventName: ticket.tier.event.name,
    eventDate: ticket.tier.event.date,
    eventVenue: ticket.tier.event.venue,
    buyerName: ticket.purchase.buyerName,
    buyerEmail: ticket.purchase.buyerEmail,
    drinkRedemptions: ticket.drinkRedemptions,
    alcoholicServed,
    nonAlcoholicServed,
    maxAlcoholic: ticket.alcoholAllowance,
    alcoholicRemaining: Math.max(0, ticket.alcoholAllowance - alcoholicServed),
  };
}
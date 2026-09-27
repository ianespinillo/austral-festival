import { prisma } from "@/lib/prisma";
import {
  DashboardData,
  DashboardPurchase,
  DashboardTicket,
  PurchaseStatus,
  TicketDiet,
  TicketStatus,
} from "./types";
import { calculateKPIs, getMockDashboardData } from "./mock-data";

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const event = await prisma.event.findFirst({
      include: {
        ticketTiers: true,
      },
    });

    if (!event) {
      return getMockDashboardData();
    }

    const [rawPurchases, rawTickets] = await Promise.all([
      prisma.purchase.findMany({
        include: {
          tier: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.ticket.findMany({
        include: {
          tier: true,
          purchase: true,
          drinkRedemptions: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    if (rawPurchases.length === 0 && rawTickets.length === 0) {
      return getMockDashboardData();
    }

    const purchases: DashboardPurchase[] = rawPurchases.map((p) => ({
      id: p.id,
      createdAt: p.createdAt.toISOString(),
      buyerName: p.buyerName,
      buyerEmail: p.buyerEmail,
      buyerDni: p.buyerDni,
      quantity: p.quantity,
      totalAmount: p.totalAmount,
      tierName: p.tier.name,
      status: p.status as PurchaseStatus,
      mpPaymentId: p.mpPaymentId,
      buyerParticipation: (p.buyerParticipation as "asistir" | "donacion") || "asistir",
      referringVolunteer: p.referringVolunteer,
    }));

    const tickets: DashboardTicket[] = rawTickets.map((t) => {
      const alcoholic = t.drinkRedemptions.filter((d) => d.drinkType === "alcoholic").length;
      const nonAlcoholic = t.drinkRedemptions.filter((d) => d.drinkType === "non_alcoholic").length;
      const isAdult = t.alcoholAllowance > 0;

      return {
        id: t.id,
        qrCode: t.qrCode,
        status: t.status as TicketStatus,
        holderName: t.holderName,
        holderDni: t.holderDni,
        isAdult,
        diet: (t.diet as TicketDiet) || "regular",
        checkedInAt: t.checkedInAt ? t.checkedInAt.toISOString() : null,
        alcoholAllowance: t.alcoholAllowance,
        alcoholicDrinksServed: alcoholic,
        nonAlcoholicDrinksServed: nonAlcoholic,
        tierName: t.tier.name,
        purchaseId: t.purchaseId,
        buyerName: t.purchase.buyerName,
        buyerEmail: t.purchase.buyerEmail,
        referringVolunteer: t.purchase.referringVolunteer,
      };
    });

    const totalCapacity = event.ticketTiers.reduce((acc, tier) => acc + tier.maxStock, 0) || 300;
    const kpis = calculateKPIs(tickets, purchases, totalCapacity);

    return {
      eventName: event.name,
      eventDate: event.date.toISOString(),
      eventVenue: event.venue,
      tickets,
      purchases,
      kpis,
      isMockData: false,
    };
  } catch (error) {
    console.warn("⚠️ No se pudo conectar a la base de datos para el dashboard, usando datos mockeados:", error);
    return getMockDashboardData();
  }
}

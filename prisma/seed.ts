import { PrismaClient } from "@prisma/client";
import { VENUE_ADDRESS } from "../lib/config";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed para producción...");

  let event = await prisma.event.findFirst();

  if (!event) {
    event = await prisma.event.create({
      data: {
        name: "Peña Austral 2026",
        description:
          "Una noche de folklore, baile y tradición argentina organizada por la Universidad Austral. Te esperamos en Mariano Acosta 1610 para cantar, bailar y compartir.",
        date: new Date("2026-11-20T23:00:00.000Z"),
        venue: VENUE_ADDRESS,
      },
    });
    console.log(`✅ Evento creado: ${event.name} (${event.id})`);
  } else {
    console.log(`ℹ️ Evento ya existente: ${event.name} (${event.id})`);
  }

  let tier = await prisma.ticketTier.findFirst({
    where: { eventId: event.id, isActive: true },
  });

  if (!tier) {
    tier = await prisma.ticketTier.create({
      data: {
        eventId: event.id,
        name: "Preventa 1",
        price: 12000,
        maxStock: 300,
        isActive: true,
      },
    });
    console.log(`✅ TicketTier creado: ${tier.name} ($${tier.price}, stock: ${tier.maxStock})`);
  } else {
    console.log(`ℹ️ TicketTier ya existente: ${tier.name} ($${tier.price}, stock: ${tier.maxStock})`);
  }

  console.log("🏁 Seed completado con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

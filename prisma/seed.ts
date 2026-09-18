import { PrismaClient } from "@prisma/client";
import { DEFAULT_ALCOHOL_ALLOWANCE, VENUE_ADDRESS } from "../lib/config";

const prisma = new PrismaClient();

async function main() {
  await prisma.drinkRedemption.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.ticketTier.deleteMany();
  await prisma.event.deleteMany();

  const event = await prisma.event.create({
    data: {
      name: "Peña Folklórica Austral 2026",
      description:
        "Una noche de folklore, baile y tradición argentina organizada por la Universidad Austral. Te esperamos en Mariano Acosta 1610 para cantar, bailar y compartir.",
      date: new Date("2026-11-20T23:00:00.000Z"),
      venue: VENUE_ADDRESS,
    },
  });

  // Preventa 1
  const tier = await prisma.ticketTier.create({
    data: {
      eventId: event.id,
      name: "Preventa 1",
      price: 12000,
      maxStock: 300,
      isActive: true,
    },
  });

  // Compra demo: 1 adulto + 1 menor
  const demoPurchase = await prisma.purchase.create({
    data: {
      tierId: tier.id,
      mpPaymentId: "demo-payment-0001",
      status: "paid",
      buyerName: "María González",
      buyerEmail: "maria.demo@example.com",
      buyerDni: "40123456",
      quantity: 3,
      totalAmount: 36000,
      buyerParticipation: "asistir",
      referringVolunteer: "Campi",
      guests: [
        {
          name: "María González",
          dni: "40123456",
          birthDate: "1998-05-12T00:00:00.000Z",
          alcoholAllowance: DEFAULT_ALCOHOL_ALLOWANCE,
          diet: "celiaco",
        },
        {
          name: "Lucas González",
          dni: "55123789",
          birthDate: "2012-03-20T00:00:00.000Z",
          alcoholAllowance: 0,
          diet: "vegetariano",
        },
        {
          name: "Carlos Pérez",
          dni: "38987654",
          birthDate: "1990-11-08T00:00:00.000Z",
          alcoholAllowance: DEFAULT_ALCOHOL_ALLOWANCE,
          diet: "sin_carne_viernes",
        },
      ],
    },
  });

  const ticket1 = await prisma.ticket.create({
    data: {
      purchaseId: demoPurchase.id,
      tierId: tier.id,
      qrCode: "TICKET-DEMO-ABCD",
      holderName: "María González",
      holderDni: "40123456",
      holderBirthDate: new Date("1998-05-12T00:00:00.000Z"),
      alcoholAllowance: DEFAULT_ALCOHOL_ALLOWANCE,
      diet: "celiaco",
    },
  });

  await prisma.ticket.create({
    data: {
      purchaseId: demoPurchase.id,
      tierId: tier.id,
      qrCode: "TICKET-DEMO-EFGH",
      holderName: "Lucas González (menor)",
      holderDni: "55123789",
      holderBirthDate: new Date("2012-03-20T00:00:00.000Z"),
      alcoholAllowance: 0,
      diet: "vegetariano",
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      purchaseId: demoPurchase.id,
      tierId: tier.id,
      qrCode: "TICKET-DEMO-LMNO",
      holderName: "Carlos Pérez",
      holderDni: "38987654",
      holderBirthDate: new Date("1990-11-08T00:00:00.000Z"),
      alcoholAllowance: DEFAULT_ALCOHOL_ALLOWANCE,
      diet: "sin_carne_viernes",
      status: "used",
      checkedInAt: new Date(),
    },
  });

  // Compra demo de donación: 2 entradas donadas
  const donationPurchase = await prisma.purchase.create({
    data: {
      tierId: tier.id,
      mpPaymentId: "demo-payment-0002",
      status: "paid",
      buyerName: "Juan Navarro",
      buyerEmail: "juan.donacion@example.com",
      buyerDni: "38291234",
      quantity: 2,
      totalAmount: 24000,
      buyerParticipation: "donacion",
      referringVolunteer: "Mili",
    },
  });

  await prisma.ticket.create({
    data: {
      purchaseId: donationPurchase.id,
      tierId: tier.id,
      qrCode: "TICKET-DONA-0001",
      holderName: "Donación (1/2)",
      holderDni: "38291234",
      alcoholAllowance: DEFAULT_ALCOHOL_ALLOWANCE,
      diet: "regular",
    },
  });
  await prisma.ticket.create({
    data: {
      purchaseId: donationPurchase.id,
      tierId: tier.id,
      qrCode: "TICKET-DONA-0002",
      holderName: "Donación (2/2)",
      holderDni: "38291234",
      alcoholAllowance: DEFAULT_ALCOHOL_ALLOWANCE,
      diet: "regular",
    },
  });

  await prisma.drinkRedemption.createMany({
    data: [
      {
        ticketId: ticket1.id,
        drinkType: "alcoholic",
        servedBy: "Equipo demo",
      },
      {
        ticketId: ticket1.id,
        drinkType: "non_alcoholic",
        servedBy: "Equipo demo",
      },
    ],
  });
  await prisma.drinkRedemption.create({
    data: {
      ticketId: ticket3.id,
      drinkType: "alcoholic",
      servedBy: "Equipo demo",
    },
  });

  console.log("✅ Base de datos seedeada correctamente");
  console.log(`   Evento: ${event.name}`);
  console.log(`   Preventa 1: $12.000`);
  console.log(`   ID del evento: ${event.id}`);
  console.log("   Entradas demo:");
  console.log("     - TICKET-DEMO-ABCD (María González, mayor)");
  console.log("     - TICKET-DEMO-EFGH (Lucas González, menor, 0 bebidas)");
  console.log("     - TICKET-DEMO-LMNO (Carlos Pérez, mayor, ya ingresó)");
  console.log("     - TICKET-DONA-0001/0002 (donación genérica)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
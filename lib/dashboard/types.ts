export type TicketDiet = "regular" | "celiaco" | "vegetariano" | "sin_carne_viernes";

export type TicketStatus = "active" | "used" | "cancelled";

export type PurchaseStatus = "pending" | "paid" | "cancelled" | "refunded";

export interface DashboardTicket {
  id: string;
  qrCode: string;
  status: TicketStatus;
  holderName: string;
  holderDni: string;
  isAdult: boolean;
  diet: TicketDiet;
  checkedInAt: string | null;
  alcoholAllowance: number;
  alcoholicDrinksServed: number;
  nonAlcoholicDrinksServed: number;
  tierName: string;
  purchaseId: string;
  buyerName: string;
  buyerEmail: string;
  referringVolunteer?: string | null;
}

export interface DashboardPurchase {
  id: string;
  createdAt: string;
  buyerName: string;
  buyerEmail: string;
  buyerDni: string | null;
  quantity: number;
  totalAmount: number;
  tierName: string;
  status: PurchaseStatus;
  mpPaymentId: string | null;
  buyerParticipation: "asistir" | "donacion";
  referringVolunteer?: string | null;
}

export interface VolunteerRanking {
  name: string;
  salesCount: number;
  ticketsCount: number;
  totalAmount: number;
  averageTicketAmount: number;
  revenueShare: number;
}

export interface DietCountsDetail {
  regular: number;
  celiaco: number;
  vegetariano: number;
  sin_carne_viernes: number;
  total: number;
}

export interface DietSummary extends DietCountsDetail {
  checkedIn: DietCountsDetail;
}

export interface TierBreakdown {
  name: string;
  ticketsSold: number;
  revenue: number;
  percentageOfRevenue: number;
}

export interface DashboardKPIs {
  // Finanzas
  totalRevenue: number;
  pendingRevenue: number;
  donationsRevenue: number;
  donationsCount: number;
  averageOrderValue: number;
  totalPurchases: number;
  paidPurchasesCount: number;
  pendingPurchasesCount: number;
  cancelledPurchasesCount: number;
  refundedPurchasesCount: number;
  tierBreakdown: TierBreakdown[];

  // Capacidad y Aforo
  totalCapacity: number;
  capacityRate: number;
  remainingCapacity: number;

  // Asistencia & Puerta
  totalTicketsSold: number;
  totalTicketsCheckedIn: number;
  totalTicketsPending: number;
  totalTicketsCancelled: number;
  attendanceRate: number;
  minorsCount: number;
  adultsCount: number;
  minorsCheckedIn: number;
  adultsCheckedIn: number;

  // Bebidas & Barra
  drinksAlcoholicServed: number;
  drinksNonAlcoholicServed: number;
  drinksTotalServed: number;
  drinksAveragePerAttendee: number;

  // Dietas & Cocina
  dietCounts: DietSummary;

  // Canales & Voluntarios
  volunteerRankings: VolunteerRanking[];
  volunteersTotalRevenue: number;
  directSalesRevenue: number;
  volunteersRevenueShare: number;
}

export interface DashboardData {
  eventName: string;
  eventDate: string;
  eventVenue: string;
  tickets: DashboardTicket[];
  purchases: DashboardPurchase[];
  kpis: DashboardKPIs;
  isMockData: boolean;
}

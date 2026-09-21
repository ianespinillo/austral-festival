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
}

export interface DietSummary {
  regular: number;
  celiaco: number;
  vegetariano: number;
  sin_carne_viernes: number;
  total: number;
}

export interface DashboardKPIs {
  totalRevenue: number;
  totalTicketsSold: number;
  totalTicketsCheckedIn: number;
  attendanceRate: number;
  totalCapacity: number;
  capacityRate: number;
  drinksAlcoholicServed: number;
  drinksNonAlcoholicServed: number;
  totalPurchases: number;
  dietCounts: DietSummary;
  volunteerRankings: VolunteerRanking[];
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

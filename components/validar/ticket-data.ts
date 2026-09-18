"use client";

export interface TicketData {
  id: string;
  qrCode: string;
  status: string;
  holderName: string;
  holderDni: string;
  holderBirthDate: string | Date | null;
  holderAge: number | null;
  isLegalAge: boolean;
  alcoholAllowance: number;
  diet: string;
  checkedInAt: string | Date | null;
  createdAt: string | Date;
  tierName: string;
  tierPrice: number;
  eventName: string;
  eventDate: string | Date;
  eventVenue: string;
  buyerName: string;
  buyerEmail: string;
  drinkRedemptions: { id: string; drinkType: string; servedAt: string | Date }[];
  alcoholicServed: number;
  nonAlcoholicServed: number;
  maxAlcoholic: number;
  alcoholicRemaining: number;
}

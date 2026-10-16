// Borrador del formulario de compra, guardado en sessionStorage antes de
// redirigir a Mercado Pago para poder restaurarlo si el usuario cancela o
// vuelve atrás sin pagar. Solo para uso en el cliente.

const DRAFT_KEY = "pena:purchase-draft";

export interface PurchaseDraft {
  selectedTierId: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  participation: "asistir" | "donacion";
  referringVolunteer: string;
  guests: { name: string; dni: string; birthDate: string; diet: string }[];
}

export function savePurchaseDraft(draft: PurchaseDraft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Sin storage (modo privado, cookies bloqueadas): no se restaura el formulario
  }
}

export function takePurchaseDraft(): PurchaseDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(DRAFT_KEY);
    return JSON.parse(raw) as PurchaseDraft;
  } catch {
    return null;
  }
}

export function clearPurchaseDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignorar
  }
}

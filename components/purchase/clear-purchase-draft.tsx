"use client";

import { useEffect } from "react";
import { clearPurchaseDraft } from "@/lib/purchase-draft";

// El pago se completó (o quedó pendiente): el borrador ya no debe restaurarse.
export function ClearPurchaseDraft() {
  useEffect(() => {
    clearPurchaseDraft();
  }, []);
  return null;
}

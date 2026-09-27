"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { reconcilePurchase } from "@/app/actions";

interface ReconcilePollerProps {
  purchaseId: string;
  paymentId?: string | null;
  maxAttempts?: number;
  intervalMs?: number;
  isDonation?: boolean;
}

export function ReconcilePoller({
  purchaseId,
  paymentId,
  maxAttempts = 8,
  intervalMs = 3000,
  isDonation = false,
}: ReconcilePollerProps) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [exhausted, setExhausted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    async function tryReconcile() {
      if (doneRef.current) return;

      attemptRef.current += 1;
      setAttempt(attemptRef.current);

      const result = await reconcilePurchase(purchaseId, paymentId);

      if (result.ok && result.data?.reconciled) {
        doneRef.current = true;
        router.refresh();
        return;
      }

      if (attemptRef.current >= maxAttempts) {
        doneRef.current = true;
        setExhausted(true);
        return;
      }

      timerRef.current = setTimeout(tryReconcile, intervalMs);
    }

    timerRef.current = setTimeout(tryReconcile, 1500);

    return () => {
      doneRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [purchaseId, paymentId, maxAttempts, intervalMs, router]);

  if (exhausted) {
    return (
      <div className="w-full rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        <p className="font-semibold">No pudimos confirmar tu pago automáticamente.</p>
        <p className="mt-1">
          Si ya abonaste,{" "}
          {isDonation
            ? "recibirás tu comprobante de donación por email en los próximos minutos."
            : "recibirás tus entradas por email en los próximos minutos."}{" "}
          Si el problema persiste, contactanos.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Confirmando tu pago… ({attempt}/{maxAttempts})
    </div>
  );
}

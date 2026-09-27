"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { loginStaff } from "@/app/actions";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginStaff(password);
      if (!result.ok) {
        toast.error(result.error ?? "Error al iniciar sesión.");
      } else {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="staffPassword" className="text-xs uppercase font-light tracking-[0.15em] text-foreground/80">
          Contraseña del equipo
        </Label>
        <Input
          id="staffPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="border-border bg-[#FDF9F0] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-amber-600 focus-visible:ring-amber-600/30"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-11 bg-gradient-to-r from-[#C69234] via-[#DEB052] to-[#C69234] hover:from-[#D49E3B] hover:via-[#E8BC60] hover:to-[#D49E3B] text-[#3A2210] font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-md shadow-amber-900/15 hover:shadow-lg border border-[#ECC472]/60 cursor-pointer"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#3A2210]" /> Verificando…
          </>
        ) : (
          "Ingresar al panel"
        )}
      </Button>
    </form>
  );
}
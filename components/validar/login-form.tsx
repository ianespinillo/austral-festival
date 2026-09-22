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
        <Label htmlFor="staffPassword" className="text-xs uppercase font-light tracking-[0.15em] text-white/80">
          Contraseña del equipo
        </Label>
        <Input
          id="staffPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="border-white/20 bg-black/40 text-white placeholder:text-white/30 focus-visible:border-white"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-11 bg-white text-[#080407] hover:bg-white/90 text-xs font-semibold uppercase tracking-[0.2em]"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#080407]" /> Verificando…
          </>
        ) : (
          "Ingresar al panel"
        )}
      </Button>
    </form>
  );
}
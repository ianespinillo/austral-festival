"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrScanner } from "./qr-scanner";
import { TicketCard } from "./ticket-card";
import { TicketData } from "./ticket-data";
import { logoutStaff, lookupTicketByCode, lookupTicketsByDni } from "@/app/actions";
import { Loader2, LogOut, ScanLine, Search, UserRound } from "lucide-react";

export function ValidationPanel({ eventName }: { eventName: string }) {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [searching, setSearching] = useState(false);
  const [dni, setDni] = useState("");
  const [manualCode, setManualCode] = useState("");

  const updateTicket = (updated: TicketData) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleQrResult = async (code: string) => {
    setSearching(true);
    try {
      const result = await lookupTicketByCode(code);
      if (!result.ok || !result.data) {
        toast.error(result.error ?? "Entrada no encontrada.");
        return;
      }
      setTickets([result.data as TicketData]);
    } finally {
      setSearching(false);
    }
  };

  const handleDniSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim()) return;
    setSearching(true);
    try {
      const result = await lookupTicketsByDni(dni);
      if (!result.ok) {
        toast.error(result.error ?? "No se encontraron entradas.");
        return;
      }
      setTickets((result.data as TicketData[]) ?? []);
    } finally {
      setSearching(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleQrResult(manualCode);
  };

  const handleLogout = async () => {
    await logoutStaff();
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold uppercase tracking-wider text-white">
            Panel de validación
          </h1>
          <p className="mt-1 text-xs font-light uppercase tracking-[0.2em] text-white/60">
            {eventName}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="border-white/20 text-xs font-light uppercase tracking-[0.2em] text-white hover:bg-white/10"
        >
          <LogOut className="mr-2 h-3.5 w-3.5 text-white" strokeWidth={1.5} /> Cerrar sesión
        </Button>
      </div>

      <Tabs defaultValue="qr" className="space-y-6">
        <TabsList className="border border-white/15 bg-[#140512] p-1 text-white">
          <TabsTrigger
            value="qr"
            className="text-xs uppercase font-light tracking-[0.15em] data-[state=active]:bg-white data-[state=active]:text-[#080407]"
          >
            <ScanLine className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} /> Escanear QR
          </TabsTrigger>
          <TabsTrigger
            value="dni"
            className="text-xs uppercase font-light tracking-[0.15em] data-[state=active]:bg-white data-[state=active]:text-[#080407]"
          >
            <UserRound className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} /> Buscar por DNI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="space-y-4">
          <div className="border border-white/15 bg-[#140512] p-4">
            <QrScanner onResult={handleQrResult} />
          </div>
          <form
            onSubmit={handleManualSubmit}
            className="flex items-end gap-2"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="manualCode" className="text-xs uppercase font-light tracking-[0.15em] text-white/80">
                Código de entrada (manual)
              </Label>
              <Input
                id="manualCode"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="TICKET-ABCD-1234"
                className="border-white/20 bg-black/40 text-white placeholder:text-white/30 focus-visible:border-white"
              />
            </div>
            <Button
              type="submit"
              disabled={!manualCode.trim()}
              className="bg-white text-[#080407] hover:bg-white/90 text-xs uppercase font-semibold tracking-[0.15em]"
            >
              <Search className="mr-2 h-3.5 w-3.5 text-[#080407]" strokeWidth={1.5} /> Buscar
            </Button>
          </form>
          {searching && (
            <div className="flex items-center gap-2 text-xs font-light uppercase tracking-[0.15em] text-white/60">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" /> Consultando…
            </div>
          )}
        </TabsContent>

        <TabsContent value="dni">
          <form onSubmit={handleDniSearch} className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="dni" className="text-xs uppercase font-light tracking-[0.15em] text-white/80">
                DNI del titular
              </Label>
              <Input
                id="dni"
                inputMode="numeric"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                placeholder="Ej: 40123456"
                required
                className="border-white/20 bg-black/40 text-white placeholder:text-white/30 focus-visible:border-white"
              />
            </div>
            <Button
              type="submit"
              disabled={searching}
              className="bg-white text-[#080407] hover:bg-white/90 text-xs uppercase font-semibold tracking-[0.15em]"
            >
              {searching ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin text-[#080407]" />
              ) : (
                <Search className="mr-2 h-3.5 w-3.5 text-[#080407]" strokeWidth={1.5} />
              )}
              Buscar
            </Button>
          </form>
          {searching && (
            <div className="mt-4 flex items-center gap-2 text-xs font-light uppercase tracking-[0.15em] text-white/60">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" /> Consultando…
            </div>
          )}
        </TabsContent>
      </Tabs>

      {tickets.length > 0 && (
        <div className="mt-8 space-y-4">
          <p className="text-xs font-light uppercase tracking-[0.2em] text-white/60">
            {tickets.length === 1
              ? "1 entrada encontrada"
              : `${tickets.length} entradas encontradas`}
          </p>
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onUpdated={updateTicket}
              onNotFound={() =>
                setTickets((prev) =>
                  prev.filter((t) => t.id !== ticket.id)
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
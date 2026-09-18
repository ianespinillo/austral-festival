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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Panel de validación
          </h1>
          <p className="text-sm text-muted-foreground">{eventName}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
        </Button>
      </div>

      <Tabs defaultValue="qr" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="qr">
            <ScanLine className="mr-2 h-4 w-4" /> Escanear QR
          </TabsTrigger>
          <TabsTrigger value="dni">
            <UserRound className="mr-2 h-4 w-4" /> Buscar por DNI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="space-y-4">
          <QrScanner onResult={handleQrResult} />
          <form
            onSubmit={handleManualSubmit}
            className="flex items-end gap-2"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="manualCode">Código de entrada (manual)</Label>
              <Input
                id="manualCode"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="TICKET-ABCD-1234"
              />
            </div>
            <Button type="submit" disabled={!manualCode.trim()}>
              <Search className="mr-2 h-4 w-4" /> Buscar
            </Button>
          </form>
          {searching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Consultando…
            </div>
          )}
        </TabsContent>

        <TabsContent value="dni">
          <form onSubmit={handleDniSearch} className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="dni">DNI del titular</Label>
              <Input
                id="dni"
                inputMode="numeric"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                placeholder="Ej: 40123456"
                required
              />
            </div>
            <Button type="submit" disabled={searching}>
              {searching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Buscar
            </Button>
          </form>
          {searching && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Consultando…
            </div>
          )}
        </TabsContent>
      </Tabs>

      {tickets.length > 0 && (
        <div className="mt-6 space-y-4">
          <p className="text-sm font-medium text-muted-foreground">
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
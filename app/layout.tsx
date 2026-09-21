import type { Metadata } from "next";
import { Geist_Mono, Lato, Rowdies } from "next/font/google";
import Link from "next/link";
import { Ticket as TicketIcon } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const lato = Lato({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const rowdies = Rowdies({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Peña Folklórica · Universidad Austral",
  description:
    "Venta de entradas para la peña folklórica de la Universidad Austral, en el Campus Pilar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${lato.variable} ${rowdies.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-base font-bold tracking-tight text-foreground"
            >
              <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                <TicketIcon className="size-4" />
              </span>
              Peña Folklórica Austral
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/#entradas"
                className="font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Entradas
              </Link>
              <Link
                href="/validar"
                className="font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Validar
              </Link>
              <Link
                href="/dashboard"
                className="font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/70 bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-muted-foreground">
            Peña Folklórica · Universidad Austral · Campus Pilar · 2026
          </div>
        </footer>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Geist_Mono, Montserrat, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { Ticket as TicketIcon } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const montserrat = Montserrat({
  weight: ["200", "300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-serif",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${playfair.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-white selection:text-black">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080407]/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
            <Link
              href="/"
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <span className="grid size-8 place-items-center rounded-sm border border-white/30 text-white">
                <TicketIcon className="size-4" strokeWidth={1.5} />
              </span>
              <span className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-white">
                Peña Folklórica Austral
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-xs uppercase font-light tracking-[0.25em]">
              <Link
                href="/#entradas"
                className="text-white/70 transition-colors hover:text-white"
              >
                Entradas
              </Link>
              <Link
                href="/validar"
                className="text-white/70 transition-colors hover:text-white"
              >
                Validar
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/10 bg-[#050204]">
          <div className="mx-auto max-w-5xl px-6 py-10 text-center text-[11px] font-light uppercase tracking-[0.25em] text-white/50">
            Peña Folklórica · Universidad Austral · Campus Pilar · 2026
          </div>
        </footer>
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
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

const navLinkClass =
  "relative text-foreground/75 transition-colors hover:text-amber-700 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-amber-700 after:transition-transform after:duration-300 hover:after:scale-x-100";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${playfair.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-amber-200/70 selection:text-amber-950">
        <header className="sticky top-0 z-40 border-b border-border bg-[#F8F1E3]/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
            <Link
              href="/"
              className="flex items-center gap-3 transition-opacity hover:opacity-85"
            >
<span className="grid size-8 -translate-y-[5px] place-items-center rounded-sm border border-amber-600/30 bg-amber-500/15 text-amber-700">
                <TicketIcon className="size-4 text-amber-700" strokeWidth={1.5} />
              </span>
              <span className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-foreground">
                Peña Austral
              </span>
            </Link>
            <nav className="flex items-center gap-3 text-xs uppercase font-medium tracking-[0.15em] sm:gap-6 sm:tracking-[0.25em]">
              <Link href="/#entradas" className={navLinkClass}>
                Entradas
              </Link>
              <Link href="/validar" className={navLinkClass}>
                Validar
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border bg-[#F1E7D2]">
          <div className="mx-auto max-w-5xl px-6 py-10 text-center text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Peña Folklórica · Universidad Austral · Campus Pilar · 2026
          </div>
        </footer>
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}

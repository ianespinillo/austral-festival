"use client";

import { MapPin, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  VENUE_ADDRESS,
  VENUE_MAPS_EMBED_URL,
  VENUE_MAPS_URL,
} from "@/lib/config";

export function VenueDialog({ venue }: { venue: string }) {
  return (
    <Dialog>
      <DialogTrigger
        className="flex cursor-pointer items-center justify-center gap-2.5 px-4 py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-700 text-center"
      >
        <MapPin className="size-4 text-amber-700 shrink-0" strokeWidth={1.5} />
        <span className="truncate">{venue}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-4 text-amber-700" strokeWidth={1.5} />
            ¿Cómo llegar?
          </DialogTitle>
          <DialogDescription className="uppercase tracking-[0.15em] text-xs">
            {VENUE_ADDRESS}
          </DialogDescription>
        </DialogHeader>
        <div aria-hidden className="grid place-items-center border border-border bg-[#EFE3C9]">
          <iframe
            src={VENUE_MAPS_EMBED_URL}
            title="Mapa de ubicación de la peña"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="pointer-events-none size-full min-h-64"
          />
        </div>
        <a
          href={VENUE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "cursor-pointer gap-2 border-amber-600/40 bg-amber-500/15 text-amber-800 hover:bg-amber-500/25"
          )}
        >
          <ExternalLink className="size-4" strokeWidth={1.5} />
          Abrir en Google Maps
        </a>
      </DialogContent>
    </Dialog>
  );
}
import { prisma } from "@/lib/prisma";
import { isStaffAuthed } from "@/lib/staff";
import { LoginForm } from "@/components/validar/login-form";
import { ValidationPanel } from "@/components/validar/validation-panel";

export const dynamic = "force-dynamic";

export default async function ValidarPage() {
  const authed = await isStaffAuthed();

  if (!authed) {
    return (
      <div className="mx-auto flex max-w-full flex-col items-center px-6 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-foreground">
          Validación de entradas
        </h1>
        <p className="mt-3 max-w-sm text-sm font-light uppercase tracking-[0.15em] text-muted-foreground leading-relaxed">
          Esta sección es para el equipo de la peña. Ingresá la contraseña para
          validar entradas y controlar el consumo de bebidas.
        </p>
        <div className="mt-8 w-full max-w-sm border border-border bg-[#FCF6E9] p-6 text-left shadow-2xl">
          <LoginForm />
        </div>
      </div>
    );
  }

  const event = await prisma.event.findFirst({
    include: { ticketTiers: true },
  });

  return <ValidationPanel eventName={event?.name ?? "Festival"} />;
}
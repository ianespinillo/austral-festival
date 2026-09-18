import { prisma } from "@/lib/prisma";
import { isStaffAuthed } from "@/lib/staff";
import { LoginForm } from "@/components/validar/login-form";
import { ValidationPanel } from "@/components/validar/validation-panel";

export const dynamic = "force-dynamic";

export default async function ValidarPage() {
  const authed = await isStaffAuthed();

  if (!authed) {
    return (
      <div className="mx-auto flex max-w-full flex-col items-center px-4 py-20">
        <h1 className="text-2xl font-semibold tracking-tight">
          Validación de entradas
        </h1>
        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
          Esta sección es para el equipo de la peña. Ingresá la contraseña para
          validar entradas y controlar el consumo de bebidas.
        </p>
        <div className="mt-8 w-full max-w-sm">
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
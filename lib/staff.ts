import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const STAFF_COOKIE = "staff_auth";

function staffToken(): string {
  const password = process.env.STAFF_PASSWORD ?? "peña-demo";
  return createHmac("sha256", "staff-folk-austral")
    .update(password)
    .digest("hex");
}

export async function isStaffAuthed(): Promise<boolean> {
  const store = await cookies();
  return staffTokenMatches(store.get(STAFF_COOKIE)?.value);
}

export async function setStaffCookie(): Promise<void> {
  const store = await cookies();
  store.set(STAFF_COOKIE, staffToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60,
    path: "/",
  });
}

export async function clearStaffCookie(): Promise<void> {
  const store = await cookies();
  store.delete(STAFF_COOKIE);
}

export async function requireStaff(): Promise<void> {
  if (!(await isStaffAuthed())) {
    throw new Error("No autorizado. Iniciá sesión como equipo de la peña.");
  }
}

function staffTokenMatches(value: string | undefined): boolean {
  if (!value) return false;
  const expected = staffToken();
  const a = Buffer.from(value, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(createHmac("sha256", a).update(b).digest(), createHmac("sha256", b).update(a).digest());
}
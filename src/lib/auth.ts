import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
const key = () => new TextEncoder().encode(process.env.JWT_SECRET!);
export type Session = { id: string; role: "ADMIN" | "MANAGER" | "STAFF"; name: string; mustChange?: boolean };
export const sign = (s: Session) =>
  new SignJWT(s).setProtectedHeader({ alg: "HS256" }).setExpirationTime("8h").sign(key());
export async function session(): Promise<Session | null> {
  const t = cookies().get("token")?.value;
  if (!t) return null;
  try {
    const p = (await jwtVerify(t, key())).payload as any;
    const u = await db.user.findUnique({ where: { id: p.id } });
    if (!u || !u.active) return null;
    return { id: u.id, role: u.role, name: u.name, mustChange: u.mustChange };
  } catch (e) { console.error("session error", e); return null; }
}
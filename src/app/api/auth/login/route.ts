import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sign } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { ipOf, blockedFor, fail, reset } from "@/lib/ratelimit";
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const key = ipOf(req) + "|" + email;
  const wait = blockedFor(key);
  if (wait > 0)
    return NextResponse.json({ error: "Too many attempts. Try again in " + wait + " min." }, { status: 429 });
  const u = await db.user.findUnique({ where: { email } });
  if (!u || !u.active || !(await bcrypt.compare(password, u.password))) {
    fail(key);
    await audit({ name: email || "(empty)" }, "LOGIN_FAIL", "Auth", "Failed login from " + ipOf(req));
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  reset(key);
  await audit(u, "LOGIN", "Auth", "Signed in from " + ipOf(req));
  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", await sign({ id: u.id, role: u.role, name: u.name }), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 28800,
    secure: process.env.COOKIE_SECURE === "true",
  });
  return res;
}
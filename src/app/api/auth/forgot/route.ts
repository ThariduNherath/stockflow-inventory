import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { ipOf, blockedFor, fail } from "@/lib/ratelimit";
export async function POST(req: Request) {
  const ok = NextResponse.json({ ok: true });
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const key = "fp|" + ipOf(req);
  if (!email || blockedFor(key) > 0) return ok;
  fail(key);
  try {
    const u = await db.user.findUnique({ where: { email } });
    if (u && u.active) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      await db.passwordReset.deleteMany({ where: { userId: u.id } });
      await db.passwordReset.create({ data: { userId: u.id, tokenHash, expires: new Date(Date.now() + 30 * 60e3) } });
      const link = (process.env.APP_URL || "http://localhost:3000") + "/reset?token=" + token;
      await sendMail(u.email, "StockFlow password reset", "Reset your password (valid for 30 minutes):\n" + link);
    }
  } catch (e) { console.error("forgot error", e); }
  return ok;
}
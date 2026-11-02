import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
export async function POST(req: Request) {
  const { token, password } = await req.json().catch(() => ({}));
  if (typeof token !== "string" || typeof password !== "string" || password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const r = await db.passwordReset.findUnique({ where: { tokenHash } });
  if (!r || r.expires < new Date()) return NextResponse.json({ error: "Link is invalid or expired" }, { status: 400 });
  const hash = await bcrypt.hash(password, 10);
  await db.$transaction([
    db.user.update({ where: { id: r.userId }, data: { password: hash, mustChange: false } }),
    db.passwordReset.deleteMany({ where: { userId: r.userId } }),
  ]);
  await audit({ id: r.userId, name: "(reset link)" }, "PASSWORD", "User", "Password reset via email");
  return NextResponse.json({ ok: true });
}
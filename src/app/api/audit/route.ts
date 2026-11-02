import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/lib/auth";
export const dynamic = "force-dynamic";
const SIZE = 20;
export async function GET(req: Request) {
  const s = await session();
  if (!s || s.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const sp = new URL(req.url).searchParams;
  const entity = sp.get("entity") || "", q = sp.get("q") || "";
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const where: any = {};
  if (entity) where.entity = entity;
  if (q) where.OR = [
    { userName: { contains: q, mode: "insensitive" } },
    { detail: { contains: q, mode: "insensitive" } },
    { action: { contains: q, mode: "insensitive" } },
  ];
  const [total, items] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * SIZE, take: SIZE }),
  ]);
  return NextResponse.json({ items, pages: Math.max(1, Math.ceil(total / SIZE)), total });
}
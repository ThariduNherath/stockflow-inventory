import { db } from "./db";
export async function audit(s: { id?: string | null; name: string }, action: string, entity: string, detail?: string) {
  try {
    await db.auditLog.create({ data: { userId: s.id || null, userName: s.name, action, entity, detail: detail || null } });
  } catch (e) { console.error("audit failed", e); }
}
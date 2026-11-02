import { z } from "zod";
import { db } from "./db";
const schema = z.object({
  sku: z.string().min(1), name: z.string().min(1),
  price: z.coerce.number().min(0),
  qty: z.coerce.number().int().min(0).default(0),
  minQty: z.coerce.number().int().min(0).default(5),
  image: z.string().optional().nullable(), category: z.string().optional(),
  supplierId: z.string().optional().nullable(),
});
export async function parse(body: unknown) {
  const d = schema.parse(body);
  const categoryId = d.category
    ? (await db.category.upsert({ where: { name: d.category }, update: {}, create: { name: d.category } })).id
    : null;
  return { sku: d.sku, name: d.name, price: d.price, qty: d.qty, minQty: d.minQty, image: d.image || null, categoryId, supplierId: d.supplierId || null };
}
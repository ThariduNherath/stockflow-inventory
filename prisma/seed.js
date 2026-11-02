const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const db = new PrismaClient();
(async () => {
  const hash = await bcrypt.hash("admin123", 10);
  await db.user.upsert({ where: { email: "admin@demo.com" }, update: {}, create: { email: "admin@demo.com", name: "Admin", password: hash, role: "ADMIN", mustChange: true } });
  await db.user.upsert({ where: { email: "staff@demo.com" }, update: {}, create: { email: "staff@demo.com", name: "Staff", password: hash, role: "STAFF", mustChange: true } });
  const cat = await db.category.upsert({ where: { name: "General" }, update: {}, create: { name: "General" } });
  for (const [i, n] of ["Keyboard", "Mouse", "Monitor", "Headset"].entries())
    await db.product.upsert({ where: { sku: "SKU-" + (i + 1) }, update: {}, create: { sku: "SKU-" + (i + 1), name: n, price: 10 + i * 15, qty: i * 4 + 2, categoryId: cat.id } });
})().finally(() => db.$disconnect());
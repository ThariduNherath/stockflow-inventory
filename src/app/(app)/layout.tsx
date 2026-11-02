import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { session } from "@/lib/auth";
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await session();
  if (!s) redirect("/login");
  if (s.mustChange) redirect("/account");
  return (
    <div>
      <Nav name={s.name} role={s.role} />
      <main className="md:ml-60 p-4 md:p-8 pt-20 md:pt-8 pb-28 max-w-7xl">{children}</main>
    </div>
  );
}
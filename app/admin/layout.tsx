import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/dashboard");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminNav nickname={admin.nickname} />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

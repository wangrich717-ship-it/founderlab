import { prisma } from "@/lib/prisma";
import { MethodAdmin } from "@/components/method-admin";

export default async function AdminMethodsPage() {
  const methods = await prisma.method.findMany({ orderBy: [{ orderNo: "asc" }, { createdAt: "asc" }] });

  return (
    <main style={{ padding: "2.5rem 2.4rem 4rem", maxWidth: 900 }}>
      <p className="kicker">Toolbox</p>
      <h1 className="font-serif-d" style={{ fontSize: "2.2rem", fontWeight: 700, margin: ".3rem 0 .4rem" }}>方法卡管理 · {methods.length}</h1>
      <p style={{ color: "var(--ink2)", fontSize: ".95rem", marginBottom: "1.8rem" }}>新增、编辑、删除工具箱里的方法卡及其配套练习。</p>
      <MethodAdmin list={methods} />
    </main>
  );
}

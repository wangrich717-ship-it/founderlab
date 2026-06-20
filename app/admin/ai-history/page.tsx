import { prisma } from "@/lib/prisma";
import { AiHistory } from "@/components/ai-history";

export default async function AdminAiHistoryPage() {
  const logs = await prisma.aiLog.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  const userIds = [...new Set(logs.map((l) => l.userId).filter(Boolean) as string[])];
  const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } });
  const umap = new Map(users.map((u) => [u.id, u.email]));

  const rows = logs.map((l) => ({
    id: l.id,
    type: l.type,
    email: l.userId ? umap.get(l.userId) || "(已删除)" : "—",
    model: l.model,
    ok: l.ok,
    input: l.input,
    output: l.output,
    error: l.error,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <main style={{ padding: "2.5rem 2.4rem 4rem", maxWidth: 920 }}>
      <p className="kicker">AI History</p>
      <h1 className="font-serif-d" style={{ fontSize: "2.2rem", fontWeight: 700, margin: ".3rem 0 .4rem" }}>AI 调用历史</h1>
      <p style={{ color: "var(--ink2)", fontSize: ".95rem", marginBottom: "1.8rem" }}>所有类型的 AI 生成：查看发送内容、生成结果，失败可重新生成。</p>
      <AiHistory logs={rows} />
    </main>
  );
}

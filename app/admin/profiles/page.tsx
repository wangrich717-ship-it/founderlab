import { prisma } from "@/lib/prisma";
import { ProfileAdminList } from "@/components/profile-admin";

export default async function AdminProfilesPage() {
  const profiles = await prisma.profile.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  const users = await prisma.user.findMany({
    where: { id: { in: [...new Set(profiles.map((p) => p.userId))] } },
    select: { id: true, email: true, nickname: true },
  });
  const umap = new Map(users.map((u) => [u.id, u]));

  const rows = profiles.map((p) => ({
    id: p.id,
    email: umap.get(p.userId)?.email || "(已删除用户)",
    nickname: umap.get(p.userId)?.nickname || "",
    createdAt: p.createdAt.toISOString(),
    model: p.model,
    contentMd: p.contentMd,
  }));

  return (
    <main style={{ padding: "2.5rem 2.4rem 4rem", maxWidth: 900 }}>
      <p className="kicker">AI History</p>
      <h1 className="font-serif-d" style={{ fontSize: "2.2rem", fontWeight: 700, margin: ".3rem 0 .4rem" }}>用户 AI 历史 · 创业者画像</h1>
      <p style={{ color: "var(--ink2)", fontSize: ".95rem", marginBottom: "1.8rem" }}>查看、编辑、删除，或基于原始回答重新生成。</p>
      <ProfileAdminList rows={rows} />
    </main>
  );
}

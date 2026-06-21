import { prisma } from "@/lib/prisma";
import { RedeemAdmin } from "@/components/redeem-admin";

export default async function AdminRedeemPage() {
  const codes = await prisma.redeemCode.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  const userIds = [...new Set(codes.map((c) => c.usedById).filter(Boolean) as string[])];
  const users = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } })
    : [];
  const umap = new Map(users.map((u) => [u.id, u.email]));

  const rows = codes.map((c) => ({
    id: c.id,
    code: c.code,
    days: c.days,
    note: c.note,
    used: !!c.usedById,
    usedByEmail: c.usedById ? umap.get(c.usedById) || "(已删除)" : null,
    usedAt: c.usedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <main style={{ padding: "2.5rem 2.4rem 4rem", maxWidth: 920 }}>
      <p className="kicker">Redeem Codes</p>
      <h1 className="font-serif-d" style={{ fontSize: "2.2rem", fontWeight: 700, margin: ".3rem 0 .4rem" }}>AI 兑换码</h1>
      <p style={{ color: "var(--ink2)", fontSize: ".95rem", marginBottom: "1.8rem" }}>
        生成可兑换「特定时长 AI 使用权限」的兑换码，发给用户。用户在「个人中心」输入即可开通。
      </p>
      <RedeemAdmin codes={rows} />
    </main>
  );
}

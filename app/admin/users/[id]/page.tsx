import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { recordTypeLabel } from "@/lib/labels";
import { ProfileAdminList } from "@/components/profile-admin";

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const [profiles, records, goals, exercises, insights, inspirations, methods] = await Promise.all([
    prisma.profile.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" } }),
    prisma.record.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.goal.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" } }),
    prisma.methodExercise.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.insight.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.inspiration.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.method.findMany({ select: { id: true, title: true } }),
  ]);
  const mTitle = new Map(methods.map((m) => [m.id, m.title]));

  const profileRows = profiles.map((p) => ({ id: p.id, email: user.email, nickname: user.nickname || "", createdAt: p.createdAt.toISOString(), model: p.model, contentMd: p.contentMd }));

  return (
    <main style={{ padding: "2.5rem 2.4rem 4rem", maxWidth: 900 }}>
      <Link href="/admin/users" className="kicker" style={{ textDecoration: "none" }}>← 用户列表</Link>
      <h1 className="font-serif-d" style={{ fontSize: "2rem", fontWeight: 700, margin: ".4rem 0 .2rem" }}>{user.email}</h1>
      <p style={{ color: "var(--ink2)", fontSize: ".9rem", marginBottom: ".4rem" }}>
        {user.nickname} · {user.role === "admin" ? "管理员" : "用户"} · {user.gender || "性别未填"} · {user.age ?? "年龄未填"}
      </p>
      {user.background && <p style={{ color: "var(--ink2)", fontSize: ".88rem", lineHeight: 1.7, marginBottom: "1rem" }}><strong>经历：</strong>{user.background}</p>}

      <Section title="创业者画像" count={profiles.length}>
        <ProfileAdminList rows={profileRows} />
      </Section>

      <Section title="目标" count={goals.length}>
        <List items={goals.map((g) => ({ key: g.id, main: g.title, sub: `${g.status} · ${g.createdAt.toLocaleDateString("zh-CN")}`, body: g.detail }))} />
      </Section>

      <Section title="记录" count={records.length}>
        <List items={records.map((r) => ({ key: r.id, main: `[${recordTypeLabel(r.type)}] ${r.content}`, sub: r.createdAt.toLocaleString("zh-CN") }))} />
      </Section>

      <Section title="方法练习" count={exercises.length}>
        <List items={exercises.map((e) => ({ key: e.id, main: `[${mTitle.get(e.methodId) || "练习"}] ${e.response}`, sub: e.createdAt.toLocaleString("zh-CN"), body: e.aiFeedback }))} />
      </Section>

      <Section title="洞察盘点" count={insights.length}>
        <List items={insights.map((i) => ({ key: i.id, main: i.content.slice(0, 120) + (i.content.length > 120 ? "…" : ""), sub: `${i.type} · ${i.createdAt.toLocaleString("zh-CN")}` }))} />
      </Section>

      <Section title="灵感" count={inspirations.length}>
        <List items={inspirations.map((i) => ({ key: i.id, main: i.rawText, sub: `${i.status} · ${i.createdAt.toLocaleDateString("zh-CN")}`, body: i.aiAngle }))} />
      </Section>
    </main>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: "2.2rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: ".6rem", marginBottom: "1rem" }}>
        <h2 className="font-serif-d" style={{ fontSize: "1.4rem", fontWeight: 700 }}>{title}</h2>
        <span style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: 700 }}>{count}</span>
      </div>
      {count === 0 ? <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>无</p> : children}
    </section>
  );
}

function List({ items }: { items: { key: string; main: string; sub: string; body?: string | null }[] }) {
  return (
    <div className="ledger">
      {items.map((it) => (
        <div key={it.key} className="ledger-cell" style={{ padding: "1rem 1.3rem" }}>
          <p style={{ fontSize: ".92rem", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{it.main}</p>
          {it.body && <p style={{ fontSize: ".82rem", color: "var(--ink2)", lineHeight: 1.6, marginTop: ".4rem", whiteSpace: "pre-wrap" }}>{it.body.slice(0, 200)}{it.body.length > 200 ? "…" : ""}</p>}
          <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: ".4rem" }}>{it.sub}</p>
        </div>
      ))}
    </div>
  );
}

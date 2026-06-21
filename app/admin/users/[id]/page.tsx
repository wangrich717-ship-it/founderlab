import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { recordTypeLabel } from "@/lib/labels";
import { ProfileAdminList } from "@/components/profile-admin";
import { AdminEntryList } from "@/components/admin-entry-list";

function clip(s: string, n = 80) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

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
        <AdminEntryList items={goals.map((g) => ({ id: g.id, title: g.title, label: g.title, plain: g.detail || g.title, ai: null, meta: `${g.status} · ${g.createdAt.toLocaleDateString("zh-CN")}` }))} />
      </Section>

      <Section title="记录" count={records.length}>
        <AdminEntryList items={records.map((r) => ({ id: r.id, title: `${recordTypeLabel(r.type)} · 记录`, label: `[${recordTypeLabel(r.type)}] ${clip(r.content)}`, plain: r.content, ai: null, meta: r.createdAt.toLocaleString("zh-CN") }))} />
      </Section>

      <Section title="方法练习" count={exercises.length}>
        <AdminEntryList items={exercises.map((e) => ({ id: e.id, kind: "exercise" as const, title: `${mTitle.get(e.methodId) || "练习"} · 反馈`, label: `[${mTitle.get(e.methodId) || "练习"}] ${clip(e.response)}`, plain: e.response, ai: e.aiFeedback, meta: e.createdAt.toLocaleString("zh-CN") }))} />
      </Section>

      <Section title="洞察盘点" count={insights.length}>
        <AdminEntryList items={insights.map((i) => ({ id: i.id, kind: "insight" as const, title: i.type === "idea_cluster" ? "连点成线" : "盘点", label: clip(i.content.replace(/[#*\n]/g, " ").trim(), 90), plain: null, ai: i.content, meta: `${i.type} · ${i.createdAt.toLocaleString("zh-CN")}` }))} />
      </Section>

      <Section title="灵感" count={inspirations.length}>
        <AdminEntryList items={inspirations.map((i) => ({ id: i.id, kind: "inspiration" as const, title: clip(i.rawText, 40), label: clip(i.rawText), plain: i.rawText, ai: i.aiAngle, meta: `${i.status} · ${i.createdAt.toLocaleDateString("zh-CN")}` }))} />
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


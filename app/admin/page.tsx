import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { resolvedAi } from "@/lib/settings";

export default async function AdminHome() {
  const [users, profiles, records, goals, insights, inspirations, aiCalls] = await Promise.all([
    prisma.user.count(),
    prisma.profile.count(),
    prisma.record.count(),
    prisma.goal.count(),
    prisma.insight.count(),
    prisma.inspiration.count(),
    prisma.aiLog.count(),
  ]);
  const ai = await resolvedAi();

  const stats = [
    { label: "用户", value: users, href: "/admin/users" },
    { label: "创业者画像", value: profiles, href: "/admin/profiles" },
    { label: "记录", value: records },
    { label: "目标", value: goals },
    { label: "洞察", value: insights },
    { label: "灵感", value: inspirations },
    { label: "AI 调用", value: aiCalls },
  ];

  return (
    <main style={{ padding: "2.5rem 2.4rem 4rem", maxWidth: 980 }}>
      <p className="kicker">Overview</p>
      <h1 className="font-serif-d" style={{ fontSize: "2.2rem", fontWeight: 700, margin: ".3rem 0 1.6rem" }}>后台概览</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        {stats.map((s) => {
          const card = (
            <div className="card" style={{ padding: "1.3rem 1.4rem", height: "100%" }}>
              <p style={{ fontSize: ".78rem", color: "var(--ink2)", fontWeight: 700 }}>{s.label}</p>
              <p className="font-serif-d" style={{ fontSize: "2.2rem", fontWeight: 700, marginTop: ".2rem" }}>{s.value}</p>
            </div>
          );
          return s.href ? <Link key={s.label} href={s.href} className="card-link" style={{ textDecoration: "none", color: "inherit" }}>{card}</Link> : <div key={s.label}>{card}</div>;
        })}
      </div>

      <div className="card" style={{ padding: "1.5rem 1.6rem" }}>
        <p className="kicker" style={{ marginBottom: ".6rem" }}>当前 AI 配置</p>
        <p style={{ fontSize: ".9rem", color: "var(--ink2)", lineHeight: 1.9 }}>
          模型：<strong style={{ color: "var(--ink)" }}>{ai.defaultModel}</strong><br />
          接口：<strong style={{ color: "var(--ink)" }}>{ai.baseUrl}</strong><br />
          密钥：<strong style={{ color: ai.apiKey ? "var(--rose-deep)" : "var(--danger)" }}>{ai.apiKey ? "已配置" : "未配置"}</strong>
        </p>
        <Link href="/admin/ai" className="btn" style={{ marginTop: "1rem" }}>编辑 AI 设置</Link>
      </div>
    </main>
  );
}

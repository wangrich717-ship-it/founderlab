import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ModuleShell, BackToDash } from "@/components/module-shell";
import { InspirationComposer } from "@/components/inspiration-composer";
import { GenerateButton } from "@/components/generate-button";
import { IconArrowRight } from "@/components/icons";
import { inspirationStatusLabel } from "@/lib/labels";

export default async function InspirationPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // 随机一道今日小问
  const prompts = await prisma.inspirationPrompt.findMany({ where: { active: true } });
  const todays = prompts.length ? prompts[Math.floor(Math.random() * prompts.length)] : null;

  const inspirations = await prisma.inspiration.findMany({
    where: { userId: session.uid },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <ModuleShell
      no="06"
      en="Inspiration"
      title="灵感"
      desc="好点子常常藏在日常里。答一个小问题，AI 结合你的画像，帮你从中挖出机会。"
      action={<GenerateButton url="/api/inspiration/cluster" label="连点成线" loadingLabel="连接中…" redirectPrefix="/insights" />}
    >
      <InspirationComposer promptId={todays?.id ?? null} promptText={todays?.text ?? "此刻冒出什么灵感？"} />

      <p className="kicker" style={{ marginBottom: "1rem" }}>灵感库 · {inspirations.length}</p>
      {inspirations.length === 0 ? (
        <p style={{ color: "var(--txt2)", fontSize: ".95rem" }}>还没有灵感。从上面答一题开始吧。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
          {inspirations.map((it) => (
            <Link
              key={it.id}
              href={`/inspiration/${it.id}`}
              className="card"
              style={{ padding: "1.2rem 1.4rem", textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "1rem" }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".55rem", marginBottom: ".4rem", flexWrap: "wrap" }}>
                  <span className="kicker">
                    {it.source === "prompt" ? "今日小问" : "随手记"} · {it.createdAt.toLocaleDateString("zh-CN")}
                  </span>
                  <span style={{ fontSize: ".68rem", fontWeight: 700, color: "var(--chestnut)", background: "var(--rose-soft)", padding: ".1rem .55rem", borderRadius: 999 }}>
                    {inspirationStatusLabel(it.status)}
                  </span>
                  {it.aiAngle && (
                    <span style={{ fontSize: ".68rem", fontWeight: 700, color: "var(--muted)" }}>· 已挖掘</span>
                  )}
                </div>
                <p style={{ fontSize: ".98rem", color: "var(--ink)", lineHeight: 1.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {it.rawText}
                </p>
              </div>
              <span style={{ flexShrink: 0, color: "var(--muted)" }}><IconArrowRight size={18} /></span>
            </Link>
          ))}
        </div>
      )}
      <BackToDash />
    </ModuleShell>
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mdToHtml } from "@/lib/markdown";
import { ModuleShell, BackToDash } from "@/components/module-shell";
import { InspirationComposer } from "@/components/inspiration-composer";
import { InspirationStatus } from "@/components/inspiration-status";
import { GenerateButton } from "@/components/generate-button";

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
      action={<GenerateButton url="/api/inspiration/cluster" label="连点成线" loadingLabel="连接中…" />}
    >
      <InspirationComposer promptId={todays?.id ?? null} promptText={todays?.text ?? "此刻冒出什么灵感？"} />

      <p className="kicker" style={{ marginBottom: "1rem" }}>灵感库</p>
      {inspirations.length === 0 ? (
        <p style={{ color: "var(--txt2)", fontSize: ".95rem" }}>还没有灵感。从上面答一题开始吧。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {inspirations.map((it) => (
            <article key={it.id} className="card" style={{ padding: "1.5rem 1.6rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: ".6rem", flexWrap: "wrap" }}>
                <span className="kicker">
                  {it.source === "prompt" ? "今日小问" : "随手记"} · {it.createdAt.toLocaleDateString("zh-CN")}
                </span>
                <InspirationStatus id={it.id} status={it.status} />
              </div>
              <p style={{ fontSize: "1.05rem", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: it.aiAngle ? "1rem" : 0 }}>
                {it.rawText}
              </p>
              {it.aiAngle && (
                <div style={{ borderTop: "1px solid var(--ink-line)", paddingTop: "1rem" }}>
                  <div className="prose-report" dangerouslySetInnerHTML={{ __html: mdToHtml(it.aiAngle) }} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      <BackToDash />
    </ModuleShell>
  );
}

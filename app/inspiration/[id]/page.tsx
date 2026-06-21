import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mdToHtml } from "@/lib/markdown";
import { ModuleShell } from "@/components/module-shell";
import { InspirationStatus } from "@/components/inspiration-status";

export default async function InspirationDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const it = await prisma.inspiration.findUnique({ where: { id } });
  if (!it || it.userId !== session.uid) notFound();

  return (
    <ModuleShell
      no="06"
      en="Inspiration"
      title="灵感详情"
      desc={`${it.source === "prompt" ? "今日小问" : "随手记"} · ${it.createdAt.toLocaleDateString("zh-CN")}`}
      back="/inspiration"
    >
      <article className="card" style={{ padding: "1.6rem 1.7rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <span className="kicker">我的记录</span>
          <InspirationStatus id={it.id} status={it.status} />
        </div>
        <p style={{ fontSize: "1.08rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{it.rawText}</p>
        {it.aiAngle && (
          <div style={{ borderTop: "1px solid var(--ink-line)", marginTop: "1.4rem", paddingTop: "1.4rem" }}>
            <p className="kicker" style={{ marginBottom: ".8rem" }}>AI 帮你挖到的机会</p>
            <div className="prose-report" dangerouslySetInnerHTML={{ __html: mdToHtml(it.aiAngle) }} />
          </div>
        )}
      </article>
    </ModuleShell>
  );
}

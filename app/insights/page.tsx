import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ModuleShell } from "@/components/module-shell";
import { GenerateButton } from "@/components/generate-button";
import { IconArrowRight } from "@/components/icons";

// 取一句话摘要：优先正文首段，否则首个小节标题
function excerpt(content: string): string {
  const lines = (content || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const firstPara = lines.find((l) => !l.startsWith("#") && !l.startsWith("##"));
  const text = (firstPara || lines.find((l) => l.startsWith("##"))?.replace(/^#+\s*/, "") || "")
    .replace(/[*#＃]/g, "")
    .trim();
  return text.length > 64 ? text.slice(0, 64) + "…" : text;
}

export default async function InsightsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const insights = await prisma.insight.findMany({
    where: { userId: session.uid },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <ModuleShell
      no="05"
      en="Insights"
      title="洞察"
      desc="让 AI 结合你的记录、目标、灵感、练习与画像，做一次整体盘点。每次只盘点上次之后的新动态。"
      action={<GenerateButton url="/api/insights/generate" label="生成新盘点" loadingLabel="盘点中…" redirectPrefix="/insights" />}
    >
      {insights.length === 0 ? (
        <p style={{ color: "var(--txt2)", fontSize: ".95rem" }}>
          还没有盘点。先去 <strong>记录</strong>、定几个 <strong>目标</strong> 或做做 <strong>练习</strong>，再点右上角生成。
        </p>
      ) : (
        <>
          <p className="kicker" style={{ marginBottom: "1rem" }}>过往盘点 · {insights.length}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
            {insights.map((it) => {
              const unread = it.status === "unread";
              const isCluster = it.type === "idea_cluster";
              return (
                <Link
                  key={it.id}
                  href={`/insights/${it.id}`}
                  className="card"
                  style={{ padding: "1.2rem 1.4rem", textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".55rem", marginBottom: ".4rem" }}>
                      {unread && <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--rose)", flexShrink: 0 }} />}
                      <span className="kicker">{isCluster ? "连点成线" : "盘点"} · {it.createdAt.toLocaleDateString("zh-CN")}</span>
                    </div>
                    <p style={{ fontSize: ".96rem", color: "var(--ink2)", lineHeight: 1.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {excerpt(it.content)}
                    </p>
                  </div>
                  <span style={{ flexShrink: 0, color: "var(--muted)" }}><IconArrowRight size={18} /></span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </ModuleShell>
  );
}

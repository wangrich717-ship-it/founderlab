import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ModuleShell } from "@/components/module-shell";
import { GenerateButton } from "@/components/generate-button";
import { MarkReadButton } from "@/components/mark-read-button";
import { ReportSections } from "@/components/report-sections";

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
      action={<GenerateButton url="/api/insights/generate" label="生成新盘点" loadingLabel="盘点中…" />}
    >
      {insights.length === 0 ? (
        <p style={{ color: "var(--txt2)", fontSize: ".95rem" }}>
          还没有盘点。先去 <strong>记录</strong>、定几个 <strong>目标</strong> 或做做 <strong>练习</strong>，再点右上角生成。
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
          {insights.map((it) => {
            const unread = it.status === "unread";
            const isCluster = it.type === "idea_cluster";
            return (
              <section key={it.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: ".55rem" }}>
                    {unread && <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--rose)" }} />}
                    <span className="kicker">
                      {isCluster ? "连点成线" : "盘点"} · {it.createdAt.toLocaleDateString("zh-CN")}
                    </span>
                  </span>
                  {unread && <MarkReadButton id={it.id} />}
                </div>
                <ReportSections content={it.content} />
              </section>
            );
          })}
        </div>
      )}
    </ModuleShell>
  );
}

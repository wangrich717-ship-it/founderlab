import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ModuleShell } from "@/components/module-shell";
import { ReportSections } from "@/components/report-sections";

export default async function InsightDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const it = await prisma.insight.findUnique({ where: { id } });
  if (!it || it.userId !== session.uid) notFound();

  // 打开即标记已读
  if (it.status === "unread") {
    await prisma.insight.update({ where: { id }, data: { status: "read" } });
  }

  const isCluster = it.type === "idea_cluster";

  return (
    <ModuleShell
      no="05"
      en="Insights"
      title={isCluster ? "连点成线" : "盘点"}
      desc={`${it.createdAt.toLocaleDateString("zh-CN")} 生成`}
      back="/insights"
    >
      <ReportSections content={it.content} />
    </ModuleShell>
  );
}

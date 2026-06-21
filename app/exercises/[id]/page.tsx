import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mdToHtml } from "@/lib/markdown";
import { ModuleShell } from "@/components/module-shell";

export default async function ExerciseDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const ex = await prisma.methodExercise.findUnique({ where: { id } });
  if (!ex || ex.userId !== session.uid) notFound();

  const method = await prisma.method.findUnique({ where: { id: ex.methodId }, select: { title: true, exercise: true } });

  return (
    <ModuleShell
      no="03"
      en="Practice"
      title="练习反馈"
      desc={`${method?.title ?? "方法练习"} · ${ex.createdAt.toLocaleDateString("zh-CN")}`}
      back={`/methods/${ex.methodId}`}
    >
      {method?.exercise && (
        <div className="card" style={{ padding: "1.3rem 1.5rem", marginBottom: "1.2rem", background: "linear-gradient(160deg,#ffffff,#fbf4f3)" }}>
          <p className="kicker" style={{ marginBottom: ".5rem" }}>练习题</p>
          <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--ink)" }}>{method.exercise}</p>
        </div>
      )}

      <article className="card" style={{ padding: "1.6rem 1.7rem" }}>
        <p className="kicker" style={{ marginBottom: ".8rem" }}>我的作答</p>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{ex.response}</p>
        {ex.aiFeedback && (
          <div style={{ borderTop: "1px solid var(--line)", marginTop: "1.4rem", paddingTop: "1.4rem" }}>
            <p className="kicker" style={{ marginBottom: ".8rem" }}>AI 反馈</p>
            <div className="prose-report" dangerouslySetInnerHTML={{ __html: mdToHtml(ex.aiFeedback) }} />
          </div>
        )}
      </article>
    </ModuleShell>
  );
}

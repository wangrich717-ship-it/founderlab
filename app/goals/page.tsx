import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ModuleShell, BackToDash } from "@/components/module-shell";
import { GoalsBoard } from "@/components/goals-board";

export default async function GoalsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const goals = await prisma.goal.findMany({
    where: { userId: session.uid },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <ModuleShell no="04" en="Goals" title="目标" desc="定下你当前的方向与关键赌注；洞察会对照它，帮你判断有没有走偏。">
      <GoalsBoard goals={goals.map((g) => ({ id: g.id, title: g.title, detail: g.detail, status: g.status, createdAt: g.createdAt.toISOString() }))} />
      <BackToDash />
    </ModuleShell>
  );
}

import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/app-nav";
import { MethodExercise } from "@/components/method-exercise";

export default async function MethodDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const m = await prisma.method.findUnique({ where: { id } });
  if (!m || m.status !== "published") notFound();

  const past = await prisma.methodExercise.findMany({
    where: { userId: session.uid, methodId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AppNav />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>
        <Link href="/methods" className="kicker" style={{ textDecoration: "none" }}>← 工具箱</Link>

        <article style={{ margin: "1rem 0 2.2rem" }}>
          <span style={{ display: "inline-block", fontSize: ".64rem", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--rose-deep)", background: "var(--rose-soft)", padding: ".25rem .7rem", borderRadius: 999, marginBottom: ".8rem" }}>
            {m.category}
          </span>
          <h1 className="font-serif-d" style={{ fontSize: "2.4rem", fontWeight: 700, marginBottom: "1rem" }}>{m.title}</h1>

          <p style={{ fontSize: "1.02rem", color: "var(--ink)", lineHeight: 1.8, marginBottom: "1.2rem" }}>{m.framework}</p>
          <blockquote style={{ borderLeft: "3px solid var(--rose)", paddingLeft: "1rem", margin: "0 0 1.4rem", color: "var(--rose-deep)", fontStyle: "italic", fontSize: "1.05rem", lineHeight: 1.6 }}>
            {m.xinfa}
          </blockquote>

          <Section label="案例">{m.caseText}</Section>
          <Section label="怎么用">{m.howToUse}</Section>
        </article>

        {m.exercise ? (
          <MethodExercise
            methodId={m.id}
            exercise={m.exercise}
            past={past.map((p) => ({ id: p.id, response: p.response, aiFeedback: p.aiFeedback, createdAt: p.createdAt.toISOString() }))}
          />
        ) : (
          <p style={{ color: "var(--muted)" }}>这张卡暂无配套练习。</p>
        )}
      </main>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <p style={{ fontWeight: 800, color: "var(--muted)", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: ".3rem" }}>{label}</p>
      <p style={{ fontSize: ".96rem", color: "var(--ink2)", lineHeight: 1.75 }}>{children}</p>
    </div>
  );
}

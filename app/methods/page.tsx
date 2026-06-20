import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ModuleShell } from "@/components/module-shell";

export default async function MethodsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const methods = await prisma.method.findMany({
    where: { status: "published" },
    orderBy: [{ orderNo: "asc" }, { createdAt: "asc" }],
  });

  const byCat = methods.reduce<Record<string, typeof methods>>((acc, m) => {
    (acc[m.category] ??= []).push(m);
    return acc;
  }, {});

  return (
    <ModuleShell no="" en="Toolbox" title="工具箱" desc={`创业真实场景下的框架与心法。${methods.length} 张方法卡，挑你此刻用得上的。`} maxWidth={1000}>
      <div>
        {Object.entries(byCat).map(([cat, list], ci) => (
          <section key={cat} className="reveal" style={{ marginBottom: "2.8rem", animationDelay: `${ci * 0.05}s` }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: ".7rem", marginBottom: "1.1rem" }}>
              <h2 className="font-serif-d" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{cat}</h2>
              <span style={{ fontSize: ".75rem", color: "var(--muted)", fontWeight: 700 }}>{list.length}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: "1.1rem" }}>
              {list.map((m) => (
                <Link key={m.id} href={`/methods/${m.id}`} className="card card-link" style={{ padding: "1.6rem 1.6rem 1.4rem", display: "flex", flexDirection: "column", textDecoration: "none", color: "var(--ink)" }}>
                  <span style={{ alignSelf: "flex-start", fontSize: ".64rem", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--rose-deep)", background: "var(--rose-soft)", padding: ".25rem .7rem", borderRadius: 999, marginBottom: ".85rem" }}>
                    {m.category}
                  </span>
                  <h3 className="font-serif-d" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: ".7rem" }}>
                    {m.title}
                  </h3>

                  <p style={{ fontSize: ".95rem", color: "var(--ink)", lineHeight: 1.75, marginBottom: "1rem" }}>{m.framework}</p>

                  <blockquote style={{ borderLeft: "3px solid var(--rose)", paddingLeft: ".9rem", margin: "0 0 1.1rem", color: "var(--rose-deep)", fontStyle: "italic", fontSize: ".95rem", lineHeight: 1.6 }}>
                    {m.xinfa}
                  </blockquote>

                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: ".4rem", borderTop: "1px solid var(--line)" }}>
                    <span style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: 700 }}>含练习 + AI 反馈</span>
                    <span style={{ color: "var(--rose-deep)", fontWeight: 800, fontSize: ".88rem" }}>去练习 →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ModuleShell>
  );
}

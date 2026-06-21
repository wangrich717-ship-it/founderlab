import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ModuleShell } from "@/components/module-shell";
import { MethodNav } from "@/components/method-nav";

// 工具箱分类的展示顺序：业务在外 → 团队 → 决策 → 自我在内
const CATEGORY_ORDER = [
  "找方向",
  "产品",
  "营销",
  "客户与增长",
  "融资",
  "合伙人",
  "团队管理",
  "决策",
  "自我精进",
  "心态与认知",
];

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

  // 按既定顺序排列，未列入的分类排到最后
  const ordered = Object.keys(byCat).sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const navItems = ordered.map((cat, i) => ({ id: `cat-${i}`, label: cat, count: byCat[cat].length }));

  return (
    <ModuleShell no="" en="Toolbox" title="工具箱" desc={`创业真实场景下的框架与心法。${methods.length} 张方法卡，挑你此刻用得上的。`} maxWidth={1160}>
      <div className="tb-wrap" style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        <MethodNav items={navItems} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {ordered.map((cat, ci) => {
            const list = byCat[cat];
            return (
              <section key={cat} id={`cat-${ci}`} className="reveal" style={{ marginBottom: "2.8rem", scrollMarginTop: "1.4rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: ".7rem", marginBottom: "1.1rem" }}>
                  <h2 className="font-serif-d" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{cat}</h2>
                  <span style={{ fontSize: ".75rem", color: "var(--muted)", fontWeight: 700 }}>{list.length}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.1rem" }}>
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
            );
          })}
        </div>
      </div>
    </ModuleShell>
  );
}

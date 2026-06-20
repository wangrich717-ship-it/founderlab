import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/app-nav";

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
}

const INDEX = [
  { no: "03", href: "/methods", title: "工具箱", en: "Toolbox", desc: "创业场景下的框架与心法" },
  { no: "04", href: "/goals", title: "目标", en: "Goals", desc: "定下方向与关键赌注，洞察对照它盘点" },
  { no: "05", href: "/insights", title: "洞察", en: "Insights", desc: "整体盘点你的状态与方向" },
  { no: "06", href: "/inspiration", title: "灵感", en: "Inspiration", desc: "从生活小问里挖掘机会" },
];

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ verify?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.onboarded) redirect("/onboarding");
  const { verify } = await searchParams;

  const profiles = await prisma.profile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const now = new Date();
  const dateline = `${now.getFullYear()} · ${now.getMonth() + 1} 月 ${now.getDate()} 日`;

  return (
    <div>
      <AppNav nickname={user.nickname} />

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "2.75rem 1.5rem 5rem" }}>
        {verify === "ok" && <Banner tone="ok">邮箱已验证成功。</Banner>}
        {verify === "invalid" && <Banner tone="warn">验证链接无效或已过期。</Banner>}
        {!user.emailVerified && (
          <Banner tone="info">邮箱尚未验证（开发期可忽略，验证链接已打印在服务端控制台）。</Banner>
        )}

        {/* ── 报头 ── */}
        <header className="reveal">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: ".5rem" }}>
            <span className="kicker">创业者手札 · Founder&apos;s Almanac · 卷一</span>
            <span style={{ fontFamily: "var(--fd)", fontSize: ".95rem", color: "var(--txt2)", letterSpacing: ".04em" }}>
              {dateline}
            </span>
          </div>
          <h1 className="font-serif-d" style={{ fontSize: "clamp(2.3rem,5.5vw,3.4rem)", fontWeight: 500, margin: ".5rem 0 .35rem", letterSpacing: ".01em" }}>
            {greeting()}，{user.nickname}
          </h1>
          <p style={{ color: "var(--txt2)", fontSize: "1.02rem", maxWidth: 560 }}>
            今天想从哪里开始？先把自己研究清楚，再在路上持续记录与复盘。
          </p>
          <hr className="rule" style={{ margin: "1.75rem 0 1.5rem" }} />
        </header>

        {/* ── 特辑：测评 + 方法库 ── */}
        <div className="feature-grid reveal" style={{ animationDelay: ".08s", marginBottom: "2.5rem" }}>
          {/* 01 自我测评 — 深色特辑 */}
          <Link
            href="/assessment"
            className="card-link"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "var(--r)",
              padding: "2rem 2.1rem 1.9rem",
              minHeight: 240,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textDecoration: "none",
              color: "#f3f1ea",
              background: "linear-gradient(150deg, #26251f 0%, #38362e 55%, #1c1b17 100%)",
              border: "1px solid rgba(28,27,23,.6)",
            }}
          >
            <span className="numeral" style={{ position: "absolute", top: "-1.5rem", right: ".5rem", fontSize: "12rem", color: "rgba(255,255,255,.06)" }}>
              01
            </span>
            <div style={{ position: "relative" }}>
              <p className="kicker" style={{ color: "#d9a3a3" }}>Assessment · 卷首</p>
              <h2 className="font-serif-d" style={{ fontSize: "2.5rem", fontWeight: 500, margin: ".5rem 0 .6rem", color: "#fff" }}>
                自我测评
              </h2>
              <p style={{ color: "rgba(246,234,212,.78)", fontSize: ".98rem", lineHeight: 1.7, maxWidth: 380 }}>
                固定 18 题，六个维度，一次诚实的自我审视。AI 据此为你生成专属的「创业者画像」——后续记录、复盘、洞察的底座。
              </p>
            </div>
            <span
              style={{
                position: "relative",
                alignSelf: "flex-start",
                marginTop: "1.5rem",
                display: "inline-flex",
                alignItems: "center",
                gap: ".5rem",
                padding: ".62rem 1.4rem",
                borderRadius: 999,
                background: "#fff",
                color: "var(--ink)",
                fontWeight: 800,
                fontSize: ".92rem",
              }}
            >
              开始测评 →
            </span>
          </Link>

          {/* 02 记录 — 浅色 */}
          <Link
            href="/records"
            className="card card-link"
            style={{
              position: "relative",
              overflow: "hidden",
              padding: "1.8rem 1.7rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textDecoration: "none",
              color: "var(--txt)",
            }}
          >
            <span className="numeral" style={{ position: "absolute", top: "-1rem", right: ".4rem", fontSize: "7rem", color: "rgba(32,32,29,.05)" }}>
              02
            </span>
            <div style={{ position: "relative" }}>
              <p className="kicker" style={{ color: "var(--chestnut)" }}>Records</p>
              <h3 className="font-serif-d" style={{ fontSize: "1.9rem", fontWeight: 600, margin: ".4rem 0 .5rem" }}>
                记录
              </h3>
              <p style={{ color: "var(--txt2)", fontSize: ".92rem", lineHeight: 1.65 }}>
                随手记下想法、决策与踩坑。
              </p>
            </div>
            <span style={{ position: "relative", marginTop: "1.25rem", color: "var(--chestnut)", fontWeight: 800, fontSize: ".9rem" }}>
              去记录 →
            </span>
          </Link>
        </div>

        {/* ── 目录 ── */}
        <section className="reveal" style={{ animationDelay: ".16s", marginBottom: "2.75rem" }}>
          <p className="kicker" style={{ marginBottom: "1rem" }}>目录 / 更多</p>
          <div className="ledger cols-2">
            {INDEX.map((m) => (
              <Link key={m.no} href={m.href} className="ledger-cell" style={{ padding: "1.4rem 1.5rem", display: "flex", alignItems: "center", gap: "1.1rem", textDecoration: "none", color: "var(--txt)" }}>
                <span className="numeral" style={{ fontSize: "2.4rem", color: "var(--chestnut)", opacity: 0.55, minWidth: "2.4rem" }}>
                  {m.no}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: ".64rem", fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--chestnut)" }}>
                    {m.en}
                  </p>
                  <h3 className="font-serif-d" style={{ fontSize: "1.4rem", fontWeight: 600, margin: ".1rem 0 .15rem" }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: ".86rem", color: "var(--txt2)" }}>{m.desc}</p>
                </div>
                <span style={{ fontSize: "1.1rem", color: "var(--chestnut)", whiteSpace: "nowrap" }}>→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 档案：历史画像 ── */}
        <section className="reveal" style={{ animationDelay: ".24s" }}>
          <p className="kicker" style={{ marginBottom: "1rem" }}>档案 / 历史画像</p>
          {profiles.length === 0 ? (
            <div className="card" style={{ padding: "1.4rem 1.6rem", color: "var(--txt2)", fontSize: ".95rem" }}>
              还没有画像。
              <Link href="/assessment" style={{ color: "var(--chestnut)", fontWeight: 800 }}>
                {" "}去做一次测评 →
              </Link>
            </div>
          ) : (
            <div className="ledger">
              {profiles.map((p) => (
                <Link
                  key={p.id}
                  href={`/profile/${p.id}`}
                  className="ledger-cell"
                  style={{
                    padding: "1.05rem 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textDecoration: "none",
                    color: "var(--txt)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>
                    <span style={{ width: 7, height: 7, transform: "rotate(45deg)", background: "var(--amber)" }} />
                    <span className="font-serif-d" style={{ fontSize: "1.25rem", fontWeight: 500 }}>
                      创业者画像
                    </span>
                  </span>
                  <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                    {p.createdAt.toLocaleDateString("zh-CN")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Banner({ children, tone }: { children: React.ReactNode; tone: "ok" | "warn" | "info" }) {
  const map = {
    ok: { bg: "rgba(181,107,107,.12)", bd: "var(--rose)", fg: "var(--rose-deep)" },
    warn: { bg: "rgba(192,88,74,.1)", bd: "var(--danger)", fg: "var(--danger)" },
    info: { bg: "rgba(181,107,107,.1)", bd: "var(--rose-soft)", fg: "var(--rose-deep)" },
  }[tone];
  return (
    <div
      className="reveal"
      style={{
        padding: ".8rem 1.1rem",
        marginBottom: "1.5rem",
        fontSize: ".9rem",
        borderRadius: "var(--r-sm)",
        border: `1px solid ${map.bd}`,
        background: map.bg,
        color: map.fg,
      }}
    >
      {children}
    </div>
  );
}

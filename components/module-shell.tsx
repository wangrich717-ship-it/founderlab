import Link from "next/link";
import { AppNav } from "./app-nav";
import { IconArrowLeft } from "./icons";

export function ModuleShell({
  no,
  en,
  title,
  desc,
  action,
  back = "/dashboard",
  children,
  maxWidth = 880,
}: {
  no: string;
  en: string;
  title: string;
  desc: string;
  action?: React.ReactNode;
  back?: string;
  children: React.ReactNode;
  maxWidth?: number;
}) {
  return (
    <div>
      <AppNav />
      <main style={{ maxWidth, margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
        <header className="reveal" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: ".9rem" }}>
            <Link
              href={back}
              aria-label="返回"
              style={{ flexShrink: 0, marginTop: ".5rem", width: 38, height: 38, borderRadius: 999, border: "1.5px solid var(--line)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink)", background: "var(--bg-card)", textDecoration: "none" }}
            >
              <IconArrowLeft size={18} />
            </Link>
            <div>
              <p className="kicker">{en}</p>
              <h1 className="font-serif-d" style={{ fontSize: "clamp(2rem,4.5vw,2.7rem)", fontWeight: 700, margin: ".3rem 0 .35rem" }}>
                {title}
              </h1>
              <p style={{ color: "var(--ink2)", fontSize: "1rem", maxWidth: 540 }}>{desc}</p>
            </div>
          </div>
          {action}
        </header>
        <hr className="rule" style={{ margin: "1.5rem 0 2rem" }} />
        {children}
      </main>
    </div>
  );
}

// 保留以兼容旧引用（现在返回按钮在顶部，底部不再需要）
export function BackToDash() {
  return null;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

const LINKS = [
  { href: "/admin", label: "概览", en: "Overview" },
  { href: "/admin/users", label: "用户", en: "Users" },
  { href: "/admin/ai-history", label: "AI 历史", en: "AI History" },
  { href: "/admin/questions", label: "测评题", en: "Assessment" },
  { href: "/admin/methods", label: "方法卡", en: "Toolbox" },
  { href: "/admin/inspiration", label: "灵感问题", en: "Inspiration" },
  { href: "/admin/prompts", label: "提示词", en: "Prompts" },
  { href: "/admin/ai", label: "AI 设置", en: "AI Config" },
];

export function AdminNav({ nickname }: { nickname?: string | null }) {
  const path = usePathname();
  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: "1px solid var(--line)",
        background: "var(--bg-card)",
        padding: "1.6rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: ".3rem",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <div style={{ padding: "0 .6rem 1.2rem" }}>
        <p className="font-serif-d" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
          手札 · 后台
        </p>
        <p style={{ fontSize: ".72rem", color: "var(--muted)" }}>{nickname} · 管理员</p>
      </div>

      {LINKS.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" : path === l.href || path.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: ".6rem .7rem",
              borderRadius: 10,
              textDecoration: "none",
              background: active ? "var(--ink)" : "transparent",
              color: active ? "#fff" : "var(--ink)",
              fontWeight: 700,
              fontSize: ".92rem",
            }}
          >
            {l.label}
            <span style={{ fontSize: ".58rem", letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.5 }}>{l.en}</span>
          </Link>
        );
      })}

      <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: ".6rem" }}>
        <Link href="/dashboard" style={{ fontSize: ".82rem", color: "var(--ink2)", textDecoration: "none", fontWeight: 700, padding: "0 .7rem" }}>
          ← 返回前台
        </Link>
        <div style={{ padding: "0 .7rem" }}>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}

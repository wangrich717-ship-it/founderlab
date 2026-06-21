"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function UserMenu({ nickname }: { nickname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: ".3rem", background: "none", border: "none", cursor: "pointer", fontSize: ".85rem", fontWeight: 700, color: "var(--ink)" }}
      >
        {nickname}
        <span style={{ fontSize: ".6rem", color: "var(--muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▾</span>
      </button>
      {open && (
        <div className="card" style={{ position: "absolute", right: 0, top: "calc(100% + .5rem)", minWidth: 150, padding: ".4rem", zIndex: 50, boxShadow: "0 12px 32px rgba(32,32,29,.14)" }}>
          <MenuItem href="/me" label="个人中心" onClick={() => setOpen(false)} />
          <MenuItem href="/reset" label="修改密码" onClick={() => setOpen(false)} />
          <div style={{ height: 1, background: "var(--line)", margin: ".35rem .4rem" }} />
          <button
            onClick={logout}
            style={{ display: "block", width: "100%", textAlign: "left", padding: ".55rem .8rem", borderRadius: 8, border: "none", background: "none", cursor: "pointer", color: "var(--muted)", fontWeight: 700, fontSize: ".88rem" }}
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{ display: "block", padding: ".55rem .8rem", borderRadius: 8, textDecoration: "none", color: "var(--ink)", fontWeight: 700, fontSize: ".88rem" }}
    >
      {label}
    </Link>
  );
}

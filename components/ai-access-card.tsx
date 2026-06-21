"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AiAccessCard({ admin, until }: { admin: boolean; until: string | null }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const activeUntil = until ? new Date(until) : null;
  const active = admin || (!!activeUntil && activeUntil.getTime() > Date.now());

  async function redeem() {
    setErr("");
    setMsg("");
    if (!code.trim()) return;
    setBusy(true);
    const res = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(d.error || "兑换失败");
    setCode("");
    setMsg(`兑换成功！AI 权限已延长 ${d.days} 天。`);
    router.refresh();
  }

  return (
    <div className="card" style={{ padding: "1.5rem 1.6rem", marginBottom: "1.8rem", maxWidth: 560 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: ".4rem" }}>
        <p className="kicker">AI 使用权限</p>
        <span style={{ fontSize: ".8rem", fontWeight: 800, color: active ? "#3f7a52" : "var(--muted)" }}>
          {admin ? "管理员 · 无限制" : active ? "已开通" : "未开通"}
        </span>
      </div>

      <p style={{ fontSize: ".9rem", color: "var(--ink2)", lineHeight: 1.6, marginBottom: active && !admin ? ".4rem" : "1rem" }}>
        {admin
          ? "你是管理员，可无限使用所有 AI 功能。"
          : active
          ? `当前可使用 AI 测评、洞察、灵感挖掘与练习反馈。`
          : "测评、洞察、灵感挖掘等 AI 功能需要权限。输入兑换码即可开通。"}
      </p>
      {active && !admin && activeUntil && (
        <p style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: "1rem" }}>
          有效期至 <strong style={{ color: "var(--ink2)" }}>{activeUntil.toLocaleString("zh-CN")}</strong>
        </p>
      )}

      {!admin && (
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="输入兑换码，如 FL-XXXX-XXXX"
            className="field-input"
            style={{ flex: 1, minWidth: 220, fontFamily: "var(--fmono, monospace)" }}
            onKeyDown={(e) => { if (e.key === "Enter") redeem(); }}
          />
          <button className="btn btn-pri" onClick={redeem} disabled={busy || !code.trim()}>{busy ? "兑换中…" : "兑换"}</button>
        </div>
      )}
      {msg && <p style={{ color: "#3f7a52", fontSize: ".85rem", marginTop: ".7rem" }}>{msg}</p>}
      {err && <p style={{ color: "var(--danger)", fontSize: ".85rem", marginTop: ".7rem" }}>{err}</p>}
    </div>
  );
}

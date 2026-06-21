"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserActions({ id, role, isSelf, aiActive }: { id: string; role: string; isSelf: boolean; aiActive: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(body: object) {
    setBusy(true);
    await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    router.refresh();
    setBusy(false);
  }
  async function grantAi() {
    const input = prompt("开通 AI 权限多少天？（在现有有效期上叠加）", "30");
    if (input === null) return;
    const days = parseInt(input, 10);
    if (!Number.isFinite(days) || days <= 0) return alert("请输入正整数天数");
    patch({ aiDays: days });
  }
  async function del() {
    if (!confirm("删除该用户及其全部数据？此操作不可恢复。")) return;
    setBusy(true);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
      <button onClick={grantAi} disabled={busy} style={btn}>开通 AI</button>
      {aiActive && <button onClick={() => patch({ aiRevoke: true })} disabled={busy} style={btn}>收回 AI</button>}
      {role === "admin" ? (
        <button onClick={() => patch({ role: "user" })} disabled={busy || isSelf} style={btn}>取消管理员</button>
      ) : (
        <button onClick={() => patch({ role: "admin" })} disabled={busy} style={btn}>设为管理员</button>
      )}
      <button onClick={del} disabled={busy || isSelf} style={{ ...btn, color: isSelf ? "var(--muted)" : "var(--danger)", borderColor: isSelf ? "var(--line)" : "rgba(192,88,74,.4)" }}>
        删除
      </button>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: ".3rem .7rem",
  borderRadius: 999,
  border: "1.5px solid var(--line)",
  background: "transparent",
  fontSize: ".74rem",
  fontWeight: 700,
  color: "var(--ink2)",
  cursor: "pointer",
};

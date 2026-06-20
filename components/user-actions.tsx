"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserActions({ id, role, isSelf }: { id: string; role: string; isSelf: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setRole(next: string) {
    setBusy(true);
    await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: next }) });
    router.refresh();
    setBusy(false);
  }
  async function del() {
    if (!confirm("删除该用户及其全部数据？此操作不可恢复。")) return;
    setBusy(true);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
      {role === "admin" ? (
        <button onClick={() => setRole("user")} disabled={busy || isSelf} style={btn}>取消管理员</button>
      ) : (
        <button onClick={() => setRole("admin")} disabled={busy} style={btn}>设为管理员</button>
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

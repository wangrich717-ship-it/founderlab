"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Row = { id: string; email: string; nickname: string; createdAt: string; model: string; contentMd: string };

export function ProfileAdminList({ rows }: { rows: Row[] }) {
  if (!rows.length) return <p style={{ color: "var(--ink2)" }}>还没有任何创业者画像。</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {rows.map((r) => (
        <ProfileRow key={r.id} r={r} />
      ))}
    </div>
  );
}

function ProfileRow({ r }: { r: Row }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(r.contentMd);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  async function save() {
    setBusy("save");
    await fetch(`/api/admin/profiles/${r.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contentMd: content }) });
    setBusy(""); setMsg("已保存"); setTimeout(() => setMsg(""), 2000);
  }
  async function regenerate() {
    if (!confirm("基于该用户的原始测评回答重新生成画像？将覆盖当前内容。")) return;
    setBusy("regen"); setMsg("");
    const res = await fetch(`/api/admin/profiles/${r.id}`, { method: "POST" });
    const d = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) return setMsg(d.error || "重新生成失败");
    if (d.contentMd) setContent(d.contentMd);
    setMsg("已重新生成");
    setTimeout(() => setMsg(""), 2500);
  }
  async function del() {
    if (!confirm("删除该画像？")) return;
    setBusy("del");
    await fetch(`/api/admin/profiles/${r.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="card" style={{ padding: "1.2rem 1.4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <span style={{ fontWeight: 700 }}>{r.email}</span>
          <span style={{ color: "var(--muted)", fontSize: ".8rem" }}> · {r.nickname}</span>
          <div style={{ fontSize: ".76rem", color: "var(--muted)" }}>{new Date(r.createdAt).toLocaleString("zh-CN")} · {r.model}</div>
        </div>
        <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
          {msg && <span style={{ fontSize: ".8rem", color: "var(--rose-deep)", fontWeight: 700 }}>{msg}</span>}
          <button onClick={() => setOpen((o) => !o)} style={btn}>{open ? "收起" : "查看 / 编辑"}</button>
          <button onClick={regenerate} disabled={!!busy} style={btn}>{busy === "regen" ? "生成中…" : "重新生成"}</button>
          <button onClick={del} disabled={!!busy} style={{ ...btn, color: "var(--danger)", borderColor: "rgba(192,88,74,.4)" }}>删除</button>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: "1rem" }}>
          <textarea className="field-input" value={content} onChange={(e) => setContent(e.target.value)} rows={14} style={{ fontFamily: "var(--fsans)", lineHeight: 1.7, resize: "vertical" }} />
          <button className="btn btn-pri" onClick={save} disabled={!!busy} style={{ marginTop: ".7rem" }}>{busy === "save" ? "保存中…" : "保存修改"}</button>
        </div>
      )}
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: ".35rem .8rem",
  borderRadius: 999,
  border: "1.5px solid var(--line)",
  background: "transparent",
  fontSize: ".76rem",
  fontWeight: 700,
  color: "var(--ink2)",
  cursor: "pointer",
};

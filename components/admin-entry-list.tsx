"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import { mdToHtml } from "@/lib/markdown";

export type AdminEntry = {
  id: string;
  label: string; // 列表行里的简短显示
  plain?: string | null; // 用户原文（纯文本）
  ai?: string | null; // AI 生成内容（markdown）
  meta: string;
  kind?: "inspiration" | "exercise" | "insight"; // 可 AI 重新生成的类型
  title: string; // 弹窗标题
};

export function AdminEntryList({ items }: { items: AdminEntry[] }) {
  const [view, setView] = useState<AdminEntry | null>(null);
  if (!items.length) return null;
  return (
    <div>
      <div className="ledger">
        {items.map((it) => (
          <div key={it.id} className="ledger-cell" style={{ padding: "1rem 1.3rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: ".92rem", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</p>
              <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: ".3rem" }}>{it.meta}</p>
            </div>
            <button onClick={() => setView(it)} style={btn}>查看</button>
          </div>
        ))}
      </div>

      <Modal open={!!view} onClose={() => setView(null)} title={view?.title || ""} maxWidth={760}>
        {view && <EntryView entry={view} onClose={() => setView(null)} />}
      </Modal>
    </div>
  );
}

function EntryView({ entry, onClose }: { entry: AdminEntry; onClose: () => void }) {
  const router = useRouter();
  const [ai, setAi] = useState(entry.ai ?? null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function regenerate() {
    if (!entry.kind) return;
    if (!confirm("基于该用户的原始内容用 AI 重新生成？将覆盖当前结果。")) return;
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/regenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: entry.kind, id: entry.id }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMsg(d.error || "重新生成失败");
    setAi(d.output);
    setMsg("已重新生成");
    router.refresh();
  }

  return (
    <div>
      <div style={{ marginBottom: "1rem", fontSize: ".8rem", color: "var(--muted)" }}>{entry.meta}</div>

      {entry.plain && (
        <>
          <p className="kicker" style={{ marginBottom: ".4rem" }}>用户内容</p>
          <pre style={preBox}>{entry.plain}</pre>
        </>
      )}

      {ai && (
        <>
          <p className="kicker" style={{ margin: entry.plain ? "1.2rem 0 .4rem" : "0 0 .4rem" }}>AI 生成的内容</p>
          <div className="prose-report" style={{ background: "var(--bg)", borderRadius: 10, padding: "1rem 1.1rem", maxHeight: 360, overflowY: "auto" }} dangerouslySetInnerHTML={{ __html: mdToHtml(ai) }} />
        </>
      )}

      {entry.kind && (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.2rem" }}>
          <button className="btn btn-pri" onClick={regenerate} disabled={busy}>{busy ? "重新生成中…" : "AI 重新生成"}</button>
          {msg && <span style={{ fontSize: ".85rem", color: "var(--rose-deep)", fontWeight: 700 }}>{msg}</span>}
        </div>
      )}
      {!entry.kind && (
        <div style={{ marginTop: "1.2rem" }}>
          <button className="btn" onClick={onClose}>关闭</button>
        </div>
      )}
    </div>
  );
}

const preBox: React.CSSProperties = { background: "var(--bg)", borderRadius: 10, padding: "1rem", fontSize: ".85rem", lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 280, overflowY: "auto", fontFamily: "var(--fsans)", margin: 0 };
const btn: React.CSSProperties = { padding: ".3rem .9rem", borderRadius: 999, border: "1.5px solid var(--line)", background: "transparent", fontSize: ".8rem", fontWeight: 700, color: "var(--ink2)", cursor: "pointer", flexShrink: 0 };

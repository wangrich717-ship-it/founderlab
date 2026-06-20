"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./modal";

const KEY_LABEL: Record<string, string> = {
  profile_report: "创业者画像报告",
  review_assist: "复盘辅助",
  insight: "洞察盘点",
  inspiration_mine: "灵感挖掘",
  idea_cluster: "连点成线",
  method_exercise: "方法练习反馈",
};

type Prompt = { id: string; key: string; version: number; content: string; model: string; temperature: number; active: boolean };

export function PromptEditor({ list }: { list: Prompt[] }) {
  const [editing, setEditing] = useState<Prompt | null>(null);

  return (
    <div>
      <div className="ledger">
        {list.map((p) => (
          <div key={p.id} className="ledger-cell" style={{ padding: "1.1rem 1.4rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="font-serif-d" style={{ fontSize: "1.2rem", fontWeight: 700 }}>{KEY_LABEL[p.key] || p.key}</span>
              <div style={{ fontSize: ".76rem", color: "var(--muted)" }}>
                {p.key} · v{p.version} · {p.model} · 温度 {p.temperature}
                {!p.active && <span style={{ color: "var(--danger)" }}> · 已停用</span>}
              </div>
            </div>
            <button onClick={() => setEditing(p)} style={btn}>编辑</button>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? KEY_LABEL[editing.key] || editing.key : ""} maxWidth={720}>
        {editing && <PromptForm p={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}

function PromptForm({ p, onDone }: { p: Prompt; onDone: () => void }) {
  const router = useRouter();
  const [content, setContent] = useState(p.content);
  const [model, setModel] = useState(p.model);
  const [temperature, setTemperature] = useState(String(p.temperature));
  const [active, setActive] = useState(p.active);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch(`/api/admin/prompts/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, model, temperature: Number(temperature), active }),
    });
    setLoading(false);
    router.refresh();
    onDone();
  }

  return (
    <div>
      <p style={{ fontSize: ".76rem", color: "var(--muted)", marginBottom: "1rem" }}>{p.key} · v{p.version}</p>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <label style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: ".3rem" }}>
          <span className="field-label">模型</span>
          <input className="field-input" value={model} onChange={(e) => setModel(e.target.value)} />
        </label>
        <label style={{ width: 120, display: "flex", flexDirection: "column", gap: ".3rem" }}>
          <span className="field-label">温度</span>
          <input className="field-input" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
        </label>
        <label style={{ display: "flex", alignItems: "flex-end", gap: ".4rem", fontSize: ".85rem", fontWeight: 700, color: "var(--ink2)", paddingBottom: ".6rem" }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> 启用
        </label>
      </div>
      <label style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
        <span className="field-label">提示词内容</span>
        <textarea className="field-input" value={content} onChange={(e) => setContent(e.target.value)} rows={16} style={{ fontFamily: "var(--fsans)", lineHeight: 1.7, resize: "vertical" }} />
      </label>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1.2rem" }}>
        <button className="btn btn-pri" onClick={save} disabled={loading}>{loading ? "保存中…" : "保存"}</button>
        <button className="btn" onClick={onDone}>取消</button>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = { padding: ".3rem .9rem", borderRadius: 999, border: "1.5px solid var(--line)", background: "transparent", fontSize: ".8rem", fontWeight: 700, color: "var(--ink2)", cursor: "pointer" };

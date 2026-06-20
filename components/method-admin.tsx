"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./modal";

type Method = {
  id: string; category: string; title: string; framework: string; xinfa: string;
  caseText: string; howToUse: string; exercise: string | null; tags: string | null;
  status: string; orderNo: number;
};

type Form = {
  category: string; title: string; framework: string; xinfa: string;
  caseText: string; howToUse: string; exercise: string; tags: string;
  status: string; orderNo: number;
};

const EMPTY: Form = { category: "", title: "", framework: "", xinfa: "", caseText: "", howToUse: "", exercise: "", tags: "", status: "published", orderNo: 0 };

export function MethodAdmin({ list }: { list: Method[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null); // id | "new" | null
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function startNew() {
    setForm({ ...EMPTY, orderNo: list.length });
    setEditing("new");
    setErr("");
  }
  function startEdit(m: Method) {
    setForm({ ...m, exercise: m.exercise || "", tags: m.tags || "" });
    setEditing(m.id);
    setErr("");
  }

  async function save() {
    setBusy(true);
    setErr("");
    const url = editing === "new" ? "/api/admin/methods" : `/api/admin/methods/${editing}`;
    const method = editing === "new" ? "POST" : "PATCH";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, orderNo: Number(form.orderNo) }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(d.error || "保存失败");
    setEditing(null);
    router.refresh();
  }

  async function del(id: string) {
    if (!confirm("删除这张方法卡？")) return;
    await fetch(`/api/admin/methods/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <button className="btn btn-pri" onClick={startNew} style={{ marginBottom: "1.4rem" }}>+ 新建方法卡</button>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "新建方法卡" : "编辑方法卡"} maxWidth={680}>
        <div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <F label="分类" v={form.category} on={(v) => setForm({ ...form, category: v })} w={200} />
            <F label="标题" v={form.title} on={(v) => setForm({ ...form, title: v })} w={200} />
            <F label="排序" v={String(form.orderNo)} on={(v) => setForm({ ...form, orderNo: Number(v) || 0 })} w={90} />
            <label style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
              <span className="field-label">状态</span>
              <select className="field-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="published">已发布</option>
                <option value="draft">草稿</option>
              </select>
            </label>
          </div>
          <T label="框架" v={form.framework} on={(v) => setForm({ ...form, framework: v })} />
          <T label="心法" v={form.xinfa} on={(v) => setForm({ ...form, xinfa: v })} />
          <T label="案例" v={form.caseText} on={(v) => setForm({ ...form, caseText: v })} />
          <T label="怎么用" v={form.howToUse} on={(v) => setForm({ ...form, howToUse: v })} />
          <T label="练习题" v={form.exercise} on={(v) => setForm({ ...form, exercise: v })} />
          <F label="标签（逗号分隔）" v={form.tags} on={(v) => setForm({ ...form, tags: v })} w={300} />
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
            <button className="btn btn-pri" onClick={save} disabled={busy}>{busy ? "保存中…" : "保存"}</button>
            <button className="btn" onClick={() => setEditing(null)}>取消</button>
            {err && <span style={{ color: "var(--danger)", fontSize: ".85rem" }}>{err}</span>}
          </div>
        </div>
      </Modal>

      <div className="ledger">
        {list.map((m) => (
          <div key={m.id} className="ledger-cell" style={{ padding: "1rem 1.3rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ width: 32, color: "var(--muted)", fontWeight: 700, fontSize: ".85rem" }}>{m.orderNo}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 700 }}>{m.title}</span>
              <span style={{ color: "var(--muted)", fontSize: ".8rem" }}> · {m.category}</span>
              {m.status !== "published" && <span style={{ color: "var(--danger)", fontSize: ".74rem", fontWeight: 700 }}> · 草稿</span>}
              {!m.exercise && <span style={{ color: "var(--danger)", fontSize: ".74rem" }}> · 无练习</span>}
            </div>
            <button onClick={() => startEdit(m)} style={btn}>编辑</button>
            <button onClick={() => del(m.id)} style={{ ...btn, color: "var(--danger)", borderColor: "rgba(192,88,74,.4)" }}>删除</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function F({ label, v, on, w }: { label: string; v: string; on: (v: string) => void; w?: number }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: ".3rem", width: w }}>
      <span className="field-label">{label}</span>
      <input className="field-input" value={v} onChange={(e) => on(e.target.value)} />
    </label>
  );
}
function T({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: ".3rem", marginBottom: ".8rem" }}>
      <span className="field-label">{label}</span>
      <textarea className="field-input" value={v} onChange={(e) => on(e.target.value)} rows={2} style={{ resize: "vertical", lineHeight: 1.6 }} />
    </label>
  );
}
const btn: React.CSSProperties = { padding: ".3rem .7rem", borderRadius: 999, border: "1.5px solid var(--line)", background: "transparent", fontSize: ".76rem", fontWeight: 700, color: "var(--ink2)", cursor: "pointer" };

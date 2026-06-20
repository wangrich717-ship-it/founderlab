"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./modal";

export type EntityField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox";
  w?: number;
};

type Item = Record<string, unknown> & { id: string };

export function EntityAdmin({
  items,
  fields,
  apiBase,
  titleKey,
  subKey,
  newLabel,
  defaults,
}: {
  items: Item[];
  fields: EntityField[];
  apiBase: string;
  titleKey: string;
  subKey?: string;
  newLabel: string;
  defaults: Record<string, unknown>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null); // id | "new" | null
  const [form, setForm] = useState<Record<string, unknown>>(defaults);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function startNew() { setForm({ ...defaults }); setEditing("new"); setErr(""); }
  function startEdit(it: Item) { setForm({ ...it }); setEditing(it.id); setErr(""); }

  async function save() {
    setBusy(true); setErr("");
    const url = editing === "new" ? apiBase : `${apiBase}/${editing}`;
    const method = editing === "new" ? "POST" : "PATCH";
    const body: Record<string, unknown> = {};
    for (const f of fields) {
      let v = form[f.key];
      if (f.type === "number") v = Number(v) || 0;
      if (f.type === "checkbox") v = !!v;
      body[f.key] = v;
    }
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(d.error || "保存失败");
    setEditing(null); router.refresh();
  }

  async function del(id: string) {
    if (!confirm("确定删除？")) return;
    await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <button className="btn btn-pri" onClick={startNew} style={{ marginBottom: "1.4rem" }}>+ {newLabel}</button>

      <div className="ledger">
        {items.map((it) => (
          <div key={it.id} className="ledger-cell" style={{ padding: "1rem 1.3rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            {subKey && <span style={{ fontSize: ".64rem", fontWeight: 800, padding: ".2rem .6rem", borderRadius: 999, background: "var(--rose-soft)", color: "var(--rose-deep)", whiteSpace: "nowrap" }}>{String(it[subKey] ?? "")}</span>}
            <span style={{ flex: 1, minWidth: 0 }}>{String(it[titleKey] ?? "")}{it.active === false && <span style={{ color: "var(--danger)", fontSize: ".74rem", fontWeight: 700 }}> · 停用</span>}</span>
            <button onClick={() => startEdit(it)} style={btn}>编辑</button>
            <button onClick={() => del(it.id)} style={{ ...btn, color: "var(--danger)", borderColor: "rgba(192,88,74,.4)" }}>删除</button>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? newLabel : "编辑"} maxWidth={620}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {fields.map((f) => (
            <label key={f.key} style={{ display: "flex", flexDirection: f.type === "checkbox" ? "row" : "column", gap: ".4rem", alignItems: f.type === "checkbox" ? "center" : "stretch" }}>
              {f.type === "checkbox" ? (
                <>
                  <input type="checkbox" checked={!!form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} />
                  <span className="field-label">{f.label}</span>
                </>
              ) : (
                <>
                  <span className="field-label">{f.label}</span>
                  {f.type === "textarea" ? (
                    <textarea className="field-input" rows={3} value={String(form[f.key] ?? "")} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} style={{ resize: "vertical", lineHeight: 1.6 }} />
                  ) : (
                    <input className="field-input" value={String(form[f.key] ?? "")} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} style={{ width: f.w }} />
                  )}
                </>
              )}
            </label>
          ))}
          {err && <span style={{ color: "var(--danger)", fontSize: ".85rem" }}>{err}</span>}
          <div style={{ display: "flex", gap: "1rem", marginTop: ".3rem" }}>
            <button className="btn btn-pri" onClick={save} disabled={busy}>{busy ? "保存中…" : "保存"}</button>
            <button className="btn" onClick={() => setEditing(null)}>取消</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const btn: React.CSSProperties = { padding: ".3rem .8rem", borderRadius: 999, border: "1.5px solid var(--line)", background: "transparent", fontSize: ".78rem", fontWeight: 700, color: "var(--ink2)", cursor: "pointer" };

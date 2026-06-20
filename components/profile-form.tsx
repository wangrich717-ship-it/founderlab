"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Init = { nickname: string; gender: string; age: string; background: string };

export function ProfileForm({ init }: { init: Init }) {
  const router = useRouter();
  const [f, setF] = useState(init);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    await fetch("/api/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={save} className="card" style={{ padding: "1.7rem 1.8rem", maxWidth: 560, display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Field label="昵称 / 姓名" value={f.nickname} onChange={(v) => setF({ ...f, nickname: v })} w={200} />
        <Field label="性别" value={f.gender} onChange={(v) => setF({ ...f, gender: v })} w={120} />
        <Field label="年龄" value={f.age} onChange={(v) => setF({ ...f, age: v })} w={100} />
      </div>
      <label style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
        <span className="field-label">经历 / 背景描述</span>
        <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>你的行业、做过的事、当前在做什么——这些会作为 AI 分析你的背景上下文。</span>
        <textarea className="field-input" value={f.background} onChange={(e) => setF({ ...f, background: e.target.value })} rows={5} style={{ resize: "vertical", lineHeight: 1.7, marginTop: ".3rem" }} />
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: ".4rem" }}>
        <button className="btn btn-pri" disabled={loading}>{loading ? "保存中…" : "保存"}</button>
        {saved && <span style={{ color: "var(--rose-deep)", fontWeight: 700, fontSize: ".88rem" }}>已保存 ✓</span>}
      </div>

      <hr className="rule" style={{ margin: ".6rem 0" }} />
      <Link href="/reset" style={{ color: "var(--ink2)", fontWeight: 700, fontSize: ".9rem", textDecoration: "underline", textUnderlineOffset: 3 }}>修改密码 →</Link>
    </form>
  );
}

function Field({ label, value, onChange, w }: { label: string; value: string; onChange: (v: string) => void; w?: number }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: ".4rem", width: w, flex: w ? "0 0 auto" : 1 }}>
      <span className="field-label">{label}</span>
      <input className="field-input" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

"use client";

import { useState } from "react";

export function AiSettingsForm({
  initial,
  effective,
}: {
  initial: { aiApiKey?: string; aiBaseUrl?: string; aiDefaultModel?: string };
  effective: { defaultModel: string; baseUrl: string; apiKey: string };
}) {
  const [apiKey, setApiKey] = useState(initial.aiApiKey || "");
  const [baseUrl, setBaseUrl] = useState(initial.aiBaseUrl || "");
  const [model, setModel] = useState(initial.aiDefaultModel || "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiApiKey: apiKey, aiBaseUrl: baseUrl, aiDefaultModel: model }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={save} className="card" style={{ padding: "1.7rem 1.8rem", maxWidth: 560, display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <Field label="API Key" hint={`留空则用 .env。当前生效：${effective.apiKey ? "已配置" : "未配置"}`} value={apiKey} onChange={setApiKey} type="password" placeholder="sk-..." />
      <Field label="接口地址 Base URL" hint={`留空则用默认。当前生效：${effective.baseUrl}`} value={baseUrl} onChange={setBaseUrl} placeholder="https://api.deepseek.com/v1" />
      <Field label="默认模型" hint={`留空则用 .env。当前生效：${effective.defaultModel}`} value={model} onChange={setModel} placeholder="deepseek-chat" />
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button className="btn btn-pri" disabled={loading}>{loading ? "保存中…" : "保存配置"}</button>
        {saved && <span style={{ color: "var(--rose-deep)", fontWeight: 700, fontSize: ".88rem" }}>已保存 ✓</span>}
      </div>
      <p style={{ fontSize: ".8rem", color: "var(--muted)", lineHeight: 1.6 }}>
        说明：这里填写的值会覆盖 <code>.env</code> 里的默认值，立即生效，无需重启。
      </p>
    </form>
  );
}

function Field({ label, hint, value, onChange, type = "text", placeholder }: { label: string; hint?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: ".35rem" }}>
      <span className="field-label">{label}</span>
      <input className="field-input" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint && <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>{hint}</span>}
    </label>
  );
}

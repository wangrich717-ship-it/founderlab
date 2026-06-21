"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowRight } from "@/components/icons";

type Past = { id: string; response: string; aiFeedback: string | null; createdAt: string };

export function MethodExercise({ methodId, exercise, past }: { methodId: string; exercise: string; past: Past[] }) {
  const router = useRouter();
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (!response.trim()) return;
    setLoading(true);
    setErr("");
    const res = await fetch(`/api/methods/${methodId}/exercise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    });
    const d = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setErr(d.error || "提交失败");
      return;
    }
    setResponse("");
    if (d.id) router.push(`/exercises/${d.id}`);
    else router.refresh();
  }

  return (
    <div>
      <div className="card" style={{ padding: "1.7rem 1.8rem", borderColor: "rgba(181,107,107,.35)", background: "linear-gradient(160deg,#ffffff,#fbf4f3)" }}>
        <p className="kicker" style={{ marginBottom: ".6rem" }}>练习 · Practice</p>
        <p style={{ fontSize: "1.08rem", lineHeight: 1.7, color: "var(--ink)", marginBottom: "1.1rem" }}>{exercise}</p>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={5}
          placeholder="把你的思考写下来，AI 会针对你的作答给出反馈…"
          className="field-input"
          style={{ lineHeight: 1.75, resize: "vertical" }}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".5rem", marginTop: "1.2rem" }}>
          <button className="btn btn-pri" onClick={submit} disabled={loading || !response.trim()}>
            {loading ? "AI 反馈生成中…" : "获取 AI 反馈"}
          </button>
          {err && <span style={{ color: "var(--danger)", fontSize: ".85rem" }}>{err}</span>}
        </div>
      </div>

      {past.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <p className="kicker" style={{ marginBottom: "1rem" }}>我的练习记录 · {past.length}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
            {past.map((p) => (
              <Link
                key={p.id}
                href={`/exercises/${p.id}`}
                className="card"
                style={{ padding: "1.2rem 1.4rem", textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: ".55rem", marginBottom: ".4rem" }}>
                    <span className="kicker">{new Date(p.createdAt).toLocaleDateString("zh-CN")}</span>
                    {p.aiFeedback && <span style={{ fontSize: ".68rem", fontWeight: 700, color: "var(--muted)" }}>· 有 AI 反馈</span>}
                  </div>
                  <p style={{ fontSize: ".98rem", color: "var(--ink)", lineHeight: 1.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.response}
                  </p>
                </div>
                <span style={{ flexShrink: 0, color: "var(--muted)" }}><IconArrowRight size={18} /></span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

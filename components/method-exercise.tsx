"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mdToHtml } from "@/lib/markdown";

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
    router.refresh();
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
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {past.map((p) => (
              <div key={p.id} className="card" style={{ padding: "1.4rem 1.6rem" }}>
                <p style={{ fontSize: ".68rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: ".4rem" }}>
                  我的作答 · {new Date(p.createdAt).toLocaleString("zh-CN")}
                </p>
                <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, marginBottom: p.aiFeedback ? "1.1rem" : 0 }}>{p.response}</p>
                {p.aiFeedback && (
                  <div style={{ borderTop: "1px solid var(--line)", paddingTop: "1.1rem" }}>
                    <p className="kicker" style={{ marginBottom: ".5rem" }}>AI 反馈</p>
                    <div className="prose-report" dangerouslySetInnerHTML={{ __html: mdToHtml(p.aiFeedback) }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

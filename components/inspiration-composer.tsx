"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InspirationComposer({
  promptId,
  promptText,
}: {
  promptId: string | null;
  promptText: string;
}) {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [free, setFree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (!rawText.trim()) return;
    setLoading(true);
    setErr("");
    const res = await fetch("/api/inspiration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId: free ? undefined : promptId, rawText }),
    });
    const d = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setErr(d.error || "提交失败");
      return;
    }
    setRawText("");
    if (d.id) router.push(`/inspiration/${d.id}`);
    else router.refresh();
  }

  return (
    <div
      className="card"
      style={{ padding: "1.6rem 1.7rem", marginBottom: "2.25rem", background: "linear-gradient(160deg,#ffffff,#fbf4f3)" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
        <p className="kicker">{free ? "随手记 · 不限题" : "今日小问"}</p>
        {free ? (
          <button onClick={() => setFree(false)} style={linkBtn}>← 回到今日小问</button>
        ) : (
          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => router.refresh()} style={linkBtn}>换一题</button>
            <button onClick={() => setFree(true)} style={linkBtn}>随手记（不限题）</button>
          </div>
        )}
      </div>

      <p className="font-serif-d" style={{ fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.5, margin: ".5rem 0 1rem" }}>
        {free ? "此刻冒出什么灵感、念头或观察？" : promptText}
      </p>

      <textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder="随口答几句就好，AI 会帮你从里面挖机会…"
        rows={3}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: "1.5px solid var(--ink-line)",
          outline: "none",
          resize: "vertical",
          fontFamily: "var(--fsans)",
          fontSize: "1.02rem",
          color: "var(--txt)",
          lineHeight: 1.7,
          paddingBottom: ".5rem",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".5rem", marginTop: "1.2rem" }}>
        <button className="btn btn-pri" onClick={submit} disabled={loading || !rawText.trim()}>
          {loading ? "挖掘中…" : "挖掘灵感 →"}
        </button>
        {err && <span style={{ color: "var(--danger)", fontSize: ".82rem" }}>{err}</span>}
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--chestnut)",
  fontWeight: 700,
  fontSize: ".82rem",
};

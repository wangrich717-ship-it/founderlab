"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RECORD_TYPES, MOOD_LEVELS } from "@/lib/labels";
import { MoodFace } from "./icons";

const REVIEW_TEMPLATE = "做成了什么：\n\n没做成什么：\n\n学到了什么：\n\n下一步：\n";
const WD = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function RecordEditor() {
  const router = useRouter();
  const [type, setType] = useState("note");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const now = new Date();
  const stamp = `${WD[now.getDay()]} · ${now.getMonth() + 1}月${now.getDate()}日`;

  async function save() {
    if (!content.trim()) return;
    setLoading(true);
    setErr("");
    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, content, mood: mood || undefined }),
    });
    const d = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setErr(d.error || "保存失败");
    router.push("/records");
  }

  return (
    <div
      style={{
        borderRadius: 18,
        background: "#fffdf7",
        boxShadow: "0 14px 40px rgba(32,32,29,.1)",
        border: "1px solid var(--line)",
        overflow: "hidden",
      }}
    >
      {/* 页眉：日期戳 + 类型 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem 1.6rem .9rem", borderBottom: "1px solid var(--line)" }}>
        <span className="hand" style={{ fontSize: "1.5rem", color: "var(--rose-deep)" }}>{stamp}</span>
        <span style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>My Journal</span>
      </div>

      <div style={{ padding: "1.3rem 1.6rem 1.6rem" }}>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1.1rem" }}>
          {RECORD_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setType(t.value);
                if (t.value === "review" && !content.trim()) setContent(REVIEW_TEMPLATE);
              }}
              style={{
                padding: ".32rem .9rem",
                borderRadius: 999,
                border: "1.5px solid",
                borderColor: type === t.value ? "var(--rose)" : "var(--line)",
                background: type === t.value ? "var(--rose-soft)" : "transparent",
                color: type === t.value ? "var(--rose-deep)" : "var(--ink2)",
                fontWeight: 700,
                fontSize: ".82rem",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 手账横线纸 */}
        <div style={{ display: "flex" }}>
          <div style={{ width: 2, background: "rgba(181,107,107,.4)", borderRadius: 2, marginRight: "1rem", flexShrink: 0 }} />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="把此刻的想法、决策、踩坑或复盘写下来…"
            rows={9}
            autoFocus
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              resize: "vertical",
              background:
                "repeating-linear-gradient(to bottom, transparent 0, transparent 1.95rem, rgba(32,32,29,.1) 1.95rem, rgba(32,32,29,.1) 2rem)",
              backgroundAttachment: "local",
              lineHeight: "2rem",
              fontSize: "1.05rem",
              fontFamily: "var(--fsans)",
              color: "var(--ink)",
              padding: 0,
            }}
          />
        </div>

        {/* 心情 + 保存（居中） */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.1rem", marginTop: "1.5rem" }}>
          <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
            <span style={{ fontSize: ".74rem", color: "var(--muted)", fontWeight: 700 }}>心情</span>
            {MOOD_LEVELS.map((lv) => {
              const v = String(lv);
              const active = mood === v;
              return (
                <button key={lv} onClick={() => setMood(active ? "" : v)} title={`心情 ${lv + 1}`}
                  style={{ display: "flex", background: "none", border: "none", cursor: "pointer", padding: 2, color: active ? "var(--rose)" : "var(--muted)", opacity: active ? 1 : 0.5 }}>
                  <MoodFace level={lv} size={24} />
                </button>
              );
            })}
          </div>
          {err && <span style={{ color: "var(--danger)", fontSize: ".85rem" }}>{err}</span>}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="btn" onClick={() => router.push("/records")}>取消</button>
            <button className="btn btn-pri" onClick={save} disabled={loading || !content.trim()}>{loading ? "保存中…" : "保存"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

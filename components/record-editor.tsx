"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const REVIEW_TEMPLATE = "做成了什么：\n\n没做成什么：\n\n学到了什么：\n\n下一步：\n";

// 记录格式模板（type 仅作为 AI 分析前的初始值，保存后由 AI 自动归类）
const TEMPLATES: { label: string; type: string; text: string }[] = [
  { label: "人物·事件", type: "comm", text: "时间：\n人物：\n发生了什么：\n我的想法：\n情绪 / 认知：\n" },
  { label: "一次决策", type: "decision", text: "要决定的事：\n可选项：\n我的选择：\n理由：\n" },
  { label: "踩了个坑", type: "pitfall", text: "发生了什么：\n根本原因：\n下次怎么避免：\n" },
  { label: "复盘", type: "review", text: REVIEW_TEMPLATE },
];
const WD = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function RecordEditor() {
  const router = useRouter();
  const [type, setType] = useState("note");
  const [content, setContent] = useState("");
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
      body: JSON.stringify({ type, content }),
    });
    const d = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setErr(d.error || "保存失败");
    router.push("/records/history");
  }

  function applyTemplate(t: { type: string; text: string }) {
    if (content.trim() && !confirm("用模板替换当前内容？")) return;
    setType(t.type);
    setContent(t.text);
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
      {/* 页眉：日期戳 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem 1.6rem .9rem", borderBottom: "1px solid var(--line)" }}>
        <span className="hand" style={{ fontSize: "1.5rem", color: "var(--rose-deep)" }}>{stamp}</span>
        <span style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>My Journal</span>
      </div>

      <div style={{ padding: "1.3rem 1.6rem 1.6rem" }}>
        {/* 套用格式模板 */}
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.1rem" }}>
          <span style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 700 }}>模板</span>
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              onClick={() => applyTemplate(t)}
              style={{ padding: ".28rem .8rem", borderRadius: 999, border: "1px dashed var(--line)", background: "transparent", color: "var(--ink2)", fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}
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

        {/* 保存（居中）。分类与情绪由 AI 保存后自动分析 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.1rem", marginTop: "1.5rem" }}>
          <span style={{ fontSize: ".74rem", color: "var(--muted)" }}>保存后 AI 会自动归类并提取关键词</span>
          {err && <span style={{ color: "var(--danger)", fontSize: ".85rem" }}>{err}</span>}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="btn" onClick={() => router.push("/dashboard")}>取消</button>
            <button className="btn btn-pri" onClick={save} disabled={loading || !content.trim()}>{loading ? "保存中…" : "保存"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

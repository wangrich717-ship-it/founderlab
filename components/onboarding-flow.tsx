"use client";

import { useState } from "react";
import { IconCompass, IconPen, IconBulb, IconSpark, IconBook, IconArrowRight } from "./icons";

const FEATURES = [
  { ic: <IconCompass size={18} />, t: "自我测评", d: "回答 18 题，AI 生成你的「创业者画像」。", bg: "rgba(247,230,205,.6)" },
  { ic: <IconPen size={18} />, t: "记录", d: "随手记下想法、决策、踩坑与复盘。", bg: "rgba(220,238,224,.6)" },
  { ic: <IconBook size={18} />, t: "目标", d: "定下方向与关键赌注。", bg: "rgba(231,225,244,.6)" },
  { ic: <IconBulb size={18} />, t: "洞察", d: "AI 结合一切，给你整体盘点。", bg: "rgba(219,232,244,.6)" },
  { ic: <IconSpark size={18} />, t: "灵感", d: "从生活小问里挖掘机会。", bg: "rgba(245,222,222,.6)" },
];

export function OnboardingFlow({ nickname }: { nickname: string }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ nickname, gender: "", age: "", background: "" });
  const [loading, setLoading] = useState(false);

  async function finish() {
    setLoading(true);
    await fetch("/api/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, onboarded: true }),
    });
    window.location.href = "/dashboard";
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
      <div className="card reveal" style={{ width: "100%", maxWidth: 560, padding: "2.4rem 2.4rem 2.6rem", borderRadius: 22 }}>
        {step === 0 ? (
          <>
            <p className="kicker">Welcome</p>
            <h1 className="font-serif-d" style={{ fontSize: "2rem", fontWeight: 700, margin: ".4rem 0 .5rem" }}>
              欢迎来到创业者手札
            </h1>
            <p style={{ color: "var(--ink2)", lineHeight: 1.8, marginBottom: "1.6rem" }}>
              一本懂你的创业手账。先看看你能用它做什么：
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: ".7rem", marginBottom: "2rem" }}>
              {FEATURES.map((x) => (
                <div key={x.t} style={{ display: "flex", alignItems: "center", gap: ".9rem", padding: ".8rem 1rem", borderRadius: 12, background: x.bg }}>
                  <span style={{ color: "var(--ink)" }}>{x.ic}</span>
                  <div>
                    <div style={{ fontWeight: 800 }}>{x.t}</div>
                    <div style={{ fontSize: ".85rem", color: "var(--ink2)" }}>{x.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-pri" style={{ width: "100%" }} onClick={() => setStep(1)}>
              下一步 <IconArrowRight size={18} />
            </button>
          </>
        ) : (
          <>
            <p className="kicker">About You</p>
            <h1 className="font-serif-d" style={{ fontSize: "2rem", fontWeight: 700, margin: ".4rem 0 .5rem" }}>
              先让 AI 认识你
            </h1>
            <p style={{ color: "var(--ink2)", lineHeight: 1.8, marginBottom: "1.6rem" }}>
              这些信息会作为 AI 分析你的背景上下文，越真实，结果越贴合你。都可后续在「个人中心」修改。
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <Field label="昵称 / 姓名" value={f.nickname} onChange={(v) => setF({ ...f, nickname: v })} w={180} />
              <Field label="性别" value={f.gender} onChange={(v) => setF({ ...f, gender: v })} w={110} />
              <Field label="年龄" value={f.age} onChange={(v) => setF({ ...f, age: v })} w={100} />
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: ".4rem", marginBottom: "1.6rem" }}>
              <span className="field-label">经历 / 背景描述</span>
              <textarea className="field-input" rows={4} value={f.background} onChange={(e) => setF({ ...f, background: e.target.value })}
                placeholder="你的行业、做过的事、当前在做什么…" style={{ resize: "vertical", lineHeight: 1.7 }} />
            </label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn" onClick={() => setStep(0)}>上一步</button>
              <button className="btn btn-pri" style={{ flex: 1 }} onClick={finish} disabled={loading}>
                {loading ? "进入中…" : "完成，进入手札"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Field({ label, value, onChange, w }: { label: string; value: string; onChange: (v: string) => void; w?: number }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: ".4rem", width: w, flex: "0 0 auto" }}>
      <span className="field-label">{label}</span>
      <input className="field-input" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IconArrowLeft } from "./icons";

type Q = { id: string; dimension: string; text: string; placeholder: string | null };

export function AssessmentFlow({ questions }: { questions: Q[] }) {
  const total = questions.length;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"intro" | "q" | "info" | "submitting">("intro");
  const [info, setInfo] = useState({ gender: "", age: "", extra: "" });
  const [err, setErr] = useState("");
  const [restored, setRestored] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const DRAFT_KEY = "assessment-draft-v1";

  useEffect(() => {
    if (phase === "q") taRef.current?.focus();
  }, [idx, phase]);

  // 进入页面时恢复上次未提交的草稿
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.answers) setAnswers(d.answers);
        if (d.info) setInfo(d.info);
        if (typeof d.idx === "number" && d.idx < total) setIdx(d.idx);
        if (Object.keys(d.answers || {}).length > 0) setRestored(true);
      }
    } catch {
      /* 忽略损坏的草稿 */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 边填边缓存（仅缓存未提交分析的内容）
  useEffect(() => {
    if (phase === "submitting") return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, info, idx }));
    } catch {
      /* localStorage 不可用时忽略 */
    }
  }, [answers, info, idx, phase]);

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* 忽略 */
    }
  }

  const q = questions[idx];
  const isLast = idx === total - 1;

  function setAns(v: string) {
    setAnswers((a) => ({ ...a, [q.id]: v }));
  }
  function next() {
    if (isLast) setPhase("info");
    else setIdx((i) => i + 1);
  }
  function prev() {
    if (idx > 0) setIdx((i) => i - 1);
  }

  async function submit() {
    setErr("");
    setPhase("submitting");
    const res = await fetch("/api/assessment/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: questions.map((qq) => ({ questionId: qq.id, text: answers[qq.id] || "" })),
        info,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error || "提交失败");
      setPhase("info");
      return;
    }
    clearDraft(); // 已完成 AI 分析，清掉草稿缓存
    window.location.href = `/profile/${data.profileId}`;
  }

  // ── 渲染 ──
  if (phase === "intro") {
    return (
      <div style={{ position: "relative", minHeight: "100vh" }}>
        <Link href="/dashboard" aria-label="返回" style={backIconStyle}>
          <IconArrowLeft size={18} />
        </Link>
      <Stage>
        <p className="kicker">Self Assessment</p>
        <h1 className="font-serif-d" style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 300, margin: "1rem 0" }}>
          {total} 个问题，<br />一次诚实的自我审视
        </h1>
        <p className="font-serif-d" style={{ fontStyle: "italic", color: "var(--txt2)", maxWidth: 460, lineHeight: 1.9, marginBottom: "2.5rem" }}>
          覆盖动机、经历、专业、优势、价值观、决策、资源、协作与能量等维度。
          答完后 AI 会为你生成专属的「创业者画像」。
        </p>
        {restored && (
          <p style={{ fontSize: ".85rem", color: "var(--rose-deep)", marginBottom: "1rem" }}>
            已为你恢复上次未完成的填写，可继续作答。
          </p>
        )}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn btn-pri" onClick={() => setPhase("q")} style={{ padding: "1.05rem 2.6rem", fontSize: "1.1rem", borderRadius: 999 }}>
            {restored ? "继续测评 →" : "开始测评 →"}
          </button>
        </div>
      </Stage>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem", gap: "1.6rem" }}>
        <div className="an-ring" />
        <style>{`
          .an-ring{width:72px;height:72px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--rose);animation:an-spin .9s linear infinite}
          @keyframes an-spin{to{transform:rotate(360deg)}}
          @keyframes an-pulse{0%,100%{opacity:.45}50%{opacity:1}}
        `}</style>
        <div>
          <p className="font-serif-d" style={{ fontSize: "1.6rem", fontWeight: 600, color: "var(--ink)", marginBottom: ".5rem" }}>
            正在生成你的创业者画像
          </p>
          <p className="kicker" style={{ animation: "an-pulse 1.5s ease-in-out infinite" }}>AI Analyzing · 请稍候</p>
        </div>
      </div>
    );
  }

  if (phase === "info") {
    return (
      <div style={{ position: "relative" }}>
        <Link href="/dashboard" aria-label="返回" style={backIconStyle}>
          <IconArrowLeft size={18} />
        </Link>
        <Progress value={100} counter="补充信息 · 可选" />
        <Stage>
          <p className="kicker">Supplement</p>
          <h2 className="font-serif-d" style={{ fontSize: "1.8rem", fontWeight: 400, margin: ".5rem 0 .35rem" }}>
            最后，补充一些信息
          </h2>
          <p style={{ color: "var(--txt2)", fontSize: ".9rem", marginBottom: "2rem" }}>
            你的性别、年龄、经历已从「个人中心」自动带入。这里只需补充任何你想让 AI 知道的其他信息（可选）。
          </p>
          <label style={{ display: "flex", flexDirection: "column", gap: ".4rem", marginBottom: "2rem" }}>
            <span className="field-label">其他想补充的</span>
            <textarea className="field-input" rows={4} value={info.extra} onChange={(e) => setInfo({ ...info, extra: e.target.value })} style={{ resize: "vertical", lineHeight: 1.7 }} />
          </label>
          {err && <p style={{ color: "var(--danger)", fontSize: ".85rem", marginBottom: "1rem" }}>{err}</p>}
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
            <button className="btn" onClick={() => { setPhase("q"); setIdx(total - 1); }}>← 返回修改</button>
            <button className="btn btn-pri" onClick={submit}>开始分析 →</button>
          </div>
        </Stage>
      </div>
    );
  }

  // phase === "q"
  return (
    <div style={{ position: "relative" }}>
      <Link href="/dashboard" aria-label="返回" style={backIconStyle}>
        <IconArrowLeft size={18} />
      </Link>
      <Progress value={(idx / total) * 100} counter={`${String(idx + 1).padStart(2, "0")} / ${total}`} />
      <Stage>
        <div style={{ marginBottom: "1.2rem" }}>
          <span className="font-mono-x" style={{ fontSize: ".62rem", color: "var(--muted)", letterSpacing: ".05em" }}>Q.{String(idx + 1).padStart(2, "0")} / {total}</span>
        </div>
        <p className="font-serif-d" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 400, lineHeight: 1.5, marginBottom: "1.75rem" }}>
          {q.text}
        </p>
        <textarea
          ref={taRef}
          value={answers[q.id] || ""}
          onChange={(e) => setAns(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              next();
            }
          }}
          rows={4}
          placeholder="写下你真实的想法…（Enter 换行）"
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid var(--bdr)",
            padding: ".75rem .1rem",
            fontSize: "1.05rem",
            color: "var(--txt)",
            outline: "none",
            resize: "none",
            lineHeight: 1.8,
            fontFamily: "var(--fb)",
          }}
        />
        <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: ".6rem", textAlign: "right" }}>Ctrl + Enter 下一题</p>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "1.4rem" }}>
          <button className="btn" onClick={prev} disabled={idx === 0}>← 上一题</button>
          <button className="btn btn-pri" onClick={next}>{isLast ? "完成填写 →" : "下一题 →"}</button>
        </div>
      </Stage>
    </div>
  );
}

const backIconStyle: React.CSSProperties = {
  position: "absolute",
  top: "1.4rem",
  left: "1.4rem",
  zIndex: 3,
  width: 40,
  height: 40,
  borderRadius: 999,
  border: "1.5px solid var(--line)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--ink)",
  background: "var(--bg-card)",
  textDecoration: "none",
};

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 3px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 640 }}>{children}</div>
    </main>
  );
}

function Progress({ value, counter }: { value: number; counter: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem 2rem 0" }}>
        <span className="font-mono-x" style={{ fontSize: ".62rem", color: "var(--muted)" }}>{counter}</span>
      </div>
      <div style={{ height: 1, background: "var(--bdr)", marginTop: ".75rem" }}>
        <div style={{ height: "100%", width: `${value}%`, background: "var(--accent)", transition: "width .4s" }} />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMail, IconArrowRight } from "./icons";

type Mode = "login" | "register";
type Screen = "form" | "verify";

const NOTES = [
  { tag: "测评", title: "找到你的方向", desc: "30 题深问，AI 生成你的创业者画像。", bg: "rgba(247,230,205,.5)", span: 1 },
  { tag: "记录 · 复盘", title: "持续积累", desc: "随手记下想法与决策，周期性复盘。", bg: "rgba(220,238,224,.5)", span: 1 },
  { tag: "灵感 · 洞察", title: "看见机会", desc: "从生活小问挖灵感，AI 替你连点成线。", bg: "rgba(231,225,244,.5)", span: 2 },
];

export function AuthLanding(_: { verified?: boolean; invalid?: boolean }) {
  const [mode, setMode] = useState<Mode>("login");
  const [screen, setScreen] = useState<Screen>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (mode === "register" && password !== confirm) {
      return setErr("两次输入的密码不一致");
    }
    setLoading(true);
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login" ? { email, password } : { email, password, nickname };
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (mode === "register") {
      if (!res.ok) return setErr(data.error || "注册失败");
      return setScreen("verify"); // 注册已自动发码
    }
    // login
    if (res.ok) return (window.location.href = "/dashboard");
    if (res.status === 403 && data.needVerify) {
      await sendCode();
      return setScreen("verify");
    }
    setErr(data.error || "登录失败");
  }

  async function sendCode() {
    await fetch("/api/auth/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, purpose: "verify" }) });
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/auth/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setErr(data.error || "验证失败");
    window.location.href = "/dashboard";
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 2.4rem" }}>
        <span className="font-serif-d" style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--ink)" }}>
          创业者手札<span style={{ color: "var(--rose)" }}>.</span>
        </span>
        <span className="hand" style={{ color: "var(--muted)", fontSize: "1.25rem" }}>know yourself, build clearly</span>
      </nav>

      <div className="auth-grid"
        style={{ flex: 1, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "3rem", alignItems: "center", padding: "1.5rem 2.4rem 3.5rem", maxWidth: 1180, width: "100%", margin: "0 auto" }}>
        {/* 左：介绍 */}
        <section>
          <p className="hand" style={{ fontSize: "1.55rem", color: "var(--rose)", marginBottom: ".3rem" }}>a founder&apos;s notebook</p>
          <h1 className="font-serif-d" style={{ fontSize: "clamp(2.7rem,5vw,4rem)", fontWeight: 700, lineHeight: 1.12, color: "var(--ink)", marginBottom: "1.1rem" }}>
            创业者手札
          </h1>
          <p style={{ color: "var(--ink2)", fontSize: "1.05rem", lineHeight: 1.8, maxWidth: 440, marginBottom: "2.2rem" }}>
            测评、记录、复盘、洞察、灵感——一本懂你的创业手账，帮你想清楚方向，也陪你走过每一步。
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem", maxWidth: 480 }}>
            {NOTES.map((n) => (
              <div key={n.title} className="note" style={{ background: n.bg, gridColumn: n.span === 2 ? "1 / -1" : "auto" }}>
                <span className="tag">{n.tag}</span>
                <h4>{n.title}</h4>
                <p>{n.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 右：卡片 */}
        <section style={{ display: "flex", justifyContent: "center" }}>
          <div className="card" style={{ width: "100%", maxWidth: 400, padding: "2.1rem 2.1rem 2.3rem", borderRadius: 20 }}>
            {screen === "verify" ? (
              <CodeStep
                email={email}
                code={code}
                setCode={setCode}
                err={err}
                loading={loading}
                onSubmit={submitCode}
                onResend={sendCode}
                onBack={() => { setScreen("form"); setErr(""); setCode(""); }}
              />
            ) : (
              <>
                <div style={{ display: "flex", background: "var(--bg)", borderRadius: 999, padding: 4, marginBottom: "1.6rem" }}>
                  {(["login", "register"] as Mode[]).map((m) => (
                    <button key={m} onClick={() => { setMode(m); setErr(""); }}
                      style={{ flex: 1, padding: ".58rem", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 800, fontSize: ".9rem", background: mode === m ? "var(--ink)" : "transparent", color: mode === m ? "#fff" : "var(--ink2)", transition: "all .2s" }}>
                      {m === "login" ? "登录" : "注册"}
                    </button>
                  ))}
                </div>

                <h2 className="font-serif-d" style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: ".25rem" }}>
                  {mode === "login" ? "欢迎回来" : "开始你的手札"}
                </h2>
                <p style={{ color: "var(--ink2)", fontSize: ".88rem", marginBottom: "1.4rem" }}>
                  {mode === "login" ? "继续你的创业者研究。" : "注册后我们会发一封验证码邮件给你。"}
                </p>

                <form onSubmit={submitForm} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {mode === "register" && <FieldRow label="昵称（可选）" value={nickname} onChange={setNickname} />}
                  <FieldRow label="邮箱" type="email" value={email} onChange={setEmail} required />
                  <FieldRow label="密码" type="password" value={password} onChange={setPassword} required />
                  {mode === "register" && <FieldRow label="再次输入密码" type="password" value={confirm} onChange={setConfirm} required />}
                  {err && <p style={{ color: "var(--danger)", fontSize: ".85rem" }}>{err}</p>}
                  <button className="btn btn-pri" disabled={loading} style={{ marginTop: ".4rem", width: "100%" }}>
                    {loading ? "请稍候…" : mode === "login" ? "进入手札" : "注册 · 获取验证码"}
                    {!loading && <IconArrowRight size={18} />}
                  </button>
                </form>

                {mode === "login" && (
                  <p style={{ textAlign: "center", marginTop: "1.1rem", fontSize: ".85rem" }}>
                    <Link href="/reset" style={{ color: "var(--ink2)", textDecoration: "underline", textUnderlineOffset: 3 }}>忘记 / 修改密码？</Link>
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      <style>{`@media(max-width:820px){.auth-grid{grid-template-columns:1fr!important;gap:2rem!important}}`}</style>
    </main>
  );
}

function CodeStep({ email, code, setCode, err, loading, onSubmit, onResend, onBack }: {
  email: string; code: string; setCode: (v: string) => void; err: string; loading: boolean;
  onSubmit: (e: React.FormEvent) => void; onResend: () => Promise<void>; onBack: () => void;
}) {
  const [cooldown, setCooldown] = useState(0);
  async function resend() {
    await onResend();
    setCooldown(60);
    const t = setInterval(() => setCooldown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  }
  return (
    <div style={{ textAlign: "center" }}>
      <span style={{ width: 56, height: 56, borderRadius: 16, background: "var(--rose-soft)", color: "var(--rose-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
        <IconMail size={28} />
      </span>
      <h2 className="font-serif-d" style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: ".4rem" }}>输入验证码</h2>
      <p style={{ color: "var(--ink2)", fontSize: ".9rem", lineHeight: 1.7, marginBottom: "1.4rem" }}>
        6 位验证码已发送至 <strong>{email}</strong>
      </p>
      <form onSubmit={onSubmit}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="000000"
          className="field-input"
          style={{ textAlign: "center", fontSize: "1.6rem", letterSpacing: "0.5rem", fontWeight: 700, marginBottom: "1rem" }}
        />
        {err && <p style={{ color: "var(--danger)", fontSize: ".85rem", marginBottom: ".75rem" }}>{err}</p>}
        <button className="btn btn-pri" disabled={loading || code.length !== 6} style={{ width: "100%", marginBottom: ".6rem" }}>
          {loading ? "验证中…" : "验证并进入"}
        </button>
      </form>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem" }}>
        <button onClick={onBack} style={linkBtn}>返回</button>
        <button onClick={resend} disabled={cooldown > 0} style={{ ...linkBtn, opacity: cooldown > 0 ? 0.5 : 1 }}>
          {cooldown > 0 ? `${cooldown}s 后重发` : "重新发送"}
        </button>
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--ink2)", fontWeight: 700, fontFamily: "var(--fsans)" };

function FieldRow({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
      <span className="field-label">{label}</span>
      <input className="field-input" type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

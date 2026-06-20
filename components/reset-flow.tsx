"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMail } from "./icons";

type Step = "request" | "code" | "done";

export function ResetFlow() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    await fetch("/api/auth/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, purpose: "reset" }) });
  }

  async function request(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    await sendCode();
    setLoading(false);
    setStep("code");
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (password !== confirm) return setErr("两次输入的密码不一致");
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code, password }) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setErr(data.error || "重置失败");
    setStep("done");
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: "2.2rem 2.1rem 2.3rem", borderRadius: 20 }}>
        <Link href="/" className="kicker" style={{ textDecoration: "none" }}>← 创业者手札</Link>

        {step === "done" ? (
          <div style={{ textAlign: "center", paddingTop: ".5rem" }}>
            <h2 className="font-serif-d" style={{ fontSize: "1.7rem", fontWeight: 700, margin: ".8rem 0 .5rem" }}>密码已重置</h2>
            <p style={{ color: "var(--ink2)", fontSize: ".92rem", marginBottom: "1.4rem" }}>用新密码登录开始使用吧。</p>
            <Link href="/" className="btn btn-pri" style={{ width: "100%" }}>去登录</Link>
          </div>
        ) : step === "request" ? (
          <>
            <h2 className="font-serif-d" style={{ fontSize: "1.7rem", fontWeight: 700, margin: ".8rem 0 .25rem" }}>修改 / 找回密码</h2>
            <p style={{ color: "var(--ink2)", fontSize: ".88rem", marginBottom: "1.4rem" }}>输入账号邮箱，我们会发送验证码。</p>
            <form onSubmit={request} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Field label="邮箱" type="email" value={email} onChange={setEmail} required />
              {err && <p style={{ color: "var(--danger)", fontSize: ".85rem" }}>{err}</p>}
              <button className="btn btn-pri" disabled={loading} style={{ width: "100%" }}>{loading ? "发送中…" : "获取验证码"}</button>
            </form>
          </>
        ) : (
          <>
            <span style={{ width: 52, height: 52, borderRadius: 15, background: "var(--rose-soft)", color: "var(--rose-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: ".9rem 0 .6rem" }}>
              <IconMail size={26} />
            </span>
            <h2 className="font-serif-d" style={{ fontSize: "1.55rem", fontWeight: 700, marginBottom: ".25rem" }}>设置新密码</h2>
            <p style={{ color: "var(--ink2)", fontSize: ".86rem", marginBottom: "1.3rem" }}>验证码已发送至 <strong>{email}</strong></p>
            <form onSubmit={reset} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="6 位验证码"
                autoComplete="off" autoCorrect="off" name="reset-otp"
                className="field-input" style={{ textAlign: "center", fontSize: "1.3rem", letterSpacing: "0.4rem", fontWeight: 700 }} />
              <Field label="新密码（至少 6 位）" type="password" value={password} onChange={setPassword} required autoComplete="new-password" />
              <Field label="再次输入新密码" type="password" value={confirm} onChange={setConfirm} required autoComplete="new-password" />
              {err && <p style={{ color: "var(--danger)", fontSize: ".85rem" }}>{err}</p>}
              <button className="btn btn-pri" disabled={loading || code.length !== 6} style={{ width: "100%" }}>{loading ? "提交中…" : "重置密码"}</button>
              <button type="button" onClick={() => { setStep("request"); setErr(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink2)", fontWeight: 700, fontSize: ".82rem" }}>← 换个邮箱</button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", required, autoComplete }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; autoComplete?: string }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
      <span className="field-label">{label}</span>
      <input className="field-input" type={type} value={value} required={required} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

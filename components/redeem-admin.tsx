"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  id: string;
  code: string;
  days: number;
  note: string | null;
  used: boolean;
  usedByEmail: string | null;
  usedAt: string | null;
  createdAt: string;
};

export function RedeemAdmin({ codes }: { codes: Row[] }) {
  const router = useRouter();
  const [count, setCount] = useState("5");
  const [days, setDays] = useState("30");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [generated, setGenerated] = useState<string[]>([]);

  async function generate() {
    setErr("");
    setBusy(true);
    const res = await fetch("/api/admin/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: parseInt(count, 10), days: parseInt(days, 10), note: note || undefined }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(d.error || "生成失败");
    setGenerated(d.codes || []);
    router.refresh();
  }

  return (
    <div>
      <div className="card" style={{ padding: "1.5rem 1.6rem", marginBottom: "1.8rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="数量">
            <input value={count} onChange={(e) => setCount(e.target.value)} className="field-input" style={{ width: 90 }} />
          </Field>
          <Field label="每个有效天数">
            <input value={days} onChange={(e) => setDays(e.target.value)} className="field-input" style={{ width: 120 }} />
          </Field>
          <Field label="备注（可选）">
            <input value={note} onChange={(e) => setNote(e.target.value)} className="field-input" placeholder="如：6月推广批次" style={{ width: 200 }} />
          </Field>
          <button className="btn btn-pri" onClick={generate} disabled={busy}>{busy ? "生成中…" : "生成兑换码"}</button>
        </div>
        {err && <p style={{ color: "var(--danger)", fontSize: ".85rem", marginTop: ".8rem" }}>{err}</p>}

        {generated.length > 0 && (
          <div style={{ marginTop: "1.2rem", borderTop: "1px solid var(--line)", paddingTop: "1.1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".6rem" }}>
              <p className="kicker">本次生成 {generated.length} 个</p>
              <button onClick={() => navigator.clipboard?.writeText(generated.join("\n"))} style={linkBtn}>复制全部</button>
            </div>
            <pre style={{ background: "var(--bg)", borderRadius: 10, padding: "1rem", fontSize: ".9rem", lineHeight: 1.8, margin: 0, fontFamily: "var(--fmono, monospace)", whiteSpace: "pre-wrap" }}>
              {generated.join("\n")}
            </pre>
          </div>
        )}
      </div>

      <p className="kicker" style={{ marginBottom: "1rem" }}>全部兑换码 · {codes.length}</p>
      {codes.length === 0 ? (
        <p style={{ color: "var(--ink2)" }}>还没有兑换码。</p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".86rem" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".08em" }}>
                <Th>兑换码</Th><Th>天数</Th><Th>备注</Th><Th>状态</Th><Th>使用者</Th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid var(--line)" }}>
                  <Td><span style={{ fontFamily: "var(--fmono, monospace)", fontWeight: 700, opacity: c.used ? 0.5 : 1 }}>{c.code}</span></Td>
                  <Td>{c.days} 天</Td>
                  <Td style={{ color: "var(--ink2)" }}>{c.note || "—"}</Td>
                  <Td>{c.used ? <span style={{ color: "var(--muted)" }}>已使用</span> : <span style={{ color: "#3f7a52", fontWeight: 700 }}>未使用</span>}</Td>
                  <Td style={{ color: "var(--ink2)", fontSize: ".8rem" }}>{c.usedByEmail || "—"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: ".35rem" }}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: ".8rem 1rem", fontWeight: 800 }}>{children}</th>;
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: ".75rem 1rem", verticalAlign: "middle", ...style }}>{children}</td>;
}
const linkBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--rose-deep)", fontWeight: 700, fontSize: ".78rem" };

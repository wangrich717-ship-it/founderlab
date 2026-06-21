"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./modal";

const TYPE_LABEL: Record<string, string> = {
  profile_report: "创业者画像",
  insight: "洞察盘点",
  inspiration_mine: "灵感挖掘",
  idea_cluster: "连点成线",
  method_exercise: "方法练习反馈",
  review_assist: "复盘辅助",
  record_tag: "记录自动打标",
};

type Log = { id: string; type: string; email: string; model: string; ok: boolean; input: string | null; output: string | null; error: string | null; createdAt: string };

export function AiHistory({ logs }: { logs: Log[] }) {
  const [view, setView] = useState<Log | null>(null);

  if (!logs.length) return <p style={{ color: "var(--ink2)" }}>还没有 AI 调用记录。</p>;

  return (
    <div>
      <div className="ledger">
        {logs.map((l) => (
          <div key={l.id} className="ledger-cell" style={{ padding: "1rem 1.3rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: ".64rem", fontWeight: 800, letterSpacing: ".06em", padding: ".22rem .6rem", borderRadius: 999, background: "var(--rose-soft)", color: "var(--rose-deep)", whiteSpace: "nowrap" }}>
              {TYPE_LABEL[l.type] || l.type}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: ".9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.email}</div>
              <div style={{ fontSize: ".74rem", color: "var(--muted)" }}>{new Date(l.createdAt).toLocaleString("zh-CN")} · {l.model}</div>
            </div>
            <span style={{ fontSize: ".74rem", fontWeight: 800, color: l.ok ? "#3f7a52" : "var(--danger)" }}>{l.ok ? "成功" : "失败"}</span>
            <button onClick={() => setView(l)} style={btn}>查看</button>
          </div>
        ))}
      </div>

      <Modal open={!!view} onClose={() => setView(null)} title={view ? TYPE_LABEL[view.type] || view.type : ""} maxWidth={760}>
        {view && <LogView log={view} onClose={() => setView(null)} />}
      </Modal>
    </div>
  );
}

function LogView({ log, onClose }: { log: Log; onClose: () => void }) {
  const router = useRouter();
  const [output, setOutput] = useState(log.output);
  const [error, setError] = useState(log.error);
  const [ok, setOk] = useState(log.ok);
  const [busy, setBusy] = useState(false);

  async function retry() {
    setBusy(true);
    const res = await fetch(`/api/admin/ai-logs/${log.id}/retry`, { method: "POST" });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(d.error || "重试失败"); setOk(false); return; }
    setOutput(d.output); setError(null); setOk(true);
    router.refresh();
  }

  return (
    <div>
      <div style={{ marginBottom: "1.1rem", fontSize: ".8rem", color: "var(--muted)" }}>
        {log.email} · {new Date(log.createdAt).toLocaleString("zh-CN")} · <span style={{ color: ok ? "#3f7a52" : "var(--danger)", fontWeight: 700 }}>{ok ? "成功" : "失败"}</span>
      </div>

      <p className="kicker" style={{ marginBottom: ".4rem" }}>发给 AI 的内容</p>
      <pre style={preBox}>{log.input || "（无）"}</pre>

      {ok ? (
        <>
          <p className="kicker" style={{ margin: "1.2rem 0 .4rem" }}>AI 生成的内容</p>
          <pre style={preBox}>{output || "（空）"}</pre>
        </>
      ) : (
        <>
          <p className="kicker" style={{ margin: "1.2rem 0 .4rem", color: "var(--danger)" }}>失败原因</p>
          <pre style={{ ...preBox, color: "var(--danger)" }}>{error || "未知错误"}</pre>
        </>
      )}

      <div style={{ display: "flex", gap: "1rem", marginTop: "1.2rem" }}>
        <button className="btn btn-pri" onClick={retry} disabled={busy}>{busy ? "重试中…" : "重新生成"}</button>
        <button className="btn" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

const preBox: React.CSSProperties = { background: "var(--bg)", borderRadius: 10, padding: "1rem", fontSize: ".82rem", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 280, overflowY: "auto", fontFamily: "var(--fsans)", margin: 0 };
const btn: React.CSSProperties = { padding: ".3rem .9rem", borderRadius: 999, border: "1.5px solid var(--line)", background: "transparent", fontSize: ".8rem", fontWeight: 700, color: "var(--ink2)", cursor: "pointer" };

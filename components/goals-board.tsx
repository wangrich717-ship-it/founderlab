"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Goal = { id: string; title: string; detail: string | null; status: string; createdAt: string };

const STATUS_LABEL: Record<string, string> = { active: "进行中", done: "已达成", dropped: "已放弃" };

export function GoalsBoard({ goals }: { goals: Goal[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function add() {
    if (!title.trim()) return;
    setLoading(true);
    setErr("");
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, detail: detail || undefined }),
    });
    const d = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setErr(d.error || "添加失败");
    setTitle("");
    setDetail("");
    router.refresh();
  }

  const active = goals.filter((g) => g.status === "active");
  const archived = goals.filter((g) => g.status !== "active");

  return (
    <div>
      <div className="card" style={{ padding: "1.4rem 1.5rem", marginBottom: "2rem" }}>
        <input
          className="field-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="一个清晰的目标 / 北极星 / 关键赌注…"
          style={{ marginBottom: ".7rem", fontSize: "1.02rem", fontWeight: 700 }}
        />
        <textarea
          className="field-input"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="（可选）补充：为什么是它、衡量标准、截止时间…"
          rows={2}
          style={{ resize: "vertical", lineHeight: 1.6 }}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".5rem", marginTop: "1.1rem" }}>
          <button className="btn btn-pri" onClick={add} disabled={loading || !title.trim()}>{loading ? "添加中…" : "添加目标"}</button>
          {err && <span style={{ color: "var(--danger)", fontSize: ".85rem" }}>{err}</span>}
        </div>
      </div>

      {active.length === 0 && archived.length === 0 ? (
        <p style={{ color: "var(--ink2)" }}>还没有目标。先定下你当前最重要的方向。</p>
      ) : (
        <>
          {active.map((g) => <GoalCard key={g.id} g={g} />)}
          {archived.length > 0 && (
            <>
              <p className="kicker" style={{ margin: "1.8rem 0 1rem" }}>已结束</p>
              {archived.map((g) => <GoalCard key={g.id} g={g} />)}
            </>
          )}
        </>
      )}
    </div>
  );
}

function GoalCard({ g }: { g: Goal }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const archived = g.status !== "active";

  async function setStatus(status: string) {
    setBusy(true);
    await fetch(`/api/goals/${g.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    router.refresh();
  }
  async function del() {
    if (!confirm("删除这个目标？")) return;
    setBusy(true);
    await fetch(`/api/goals/${g.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="card" style={{ padding: "1.2rem 1.4rem", marginBottom: ".8rem", opacity: archived ? 0.6 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="font-serif-d" style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: g.detail ? ".3rem" : 0, textDecoration: g.status === "done" ? "line-through" : "none" }}>
            {g.title}
          </h3>
          {g.detail && <p style={{ fontSize: ".9rem", color: "var(--ink2)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{g.detail}</p>}
          {archived && <span style={{ fontSize: ".74rem", fontWeight: 700, color: "var(--muted)" }}>{STATUS_LABEL[g.status]}</span>}
        </div>
        <div style={{ display: "flex", gap: ".4rem", flexShrink: 0 }}>
          {!archived ? (
            <>
              <button onClick={() => setStatus("done")} disabled={busy} style={btn}>达成</button>
              <button onClick={() => setStatus("dropped")} disabled={busy} style={btn}>放弃</button>
            </>
          ) : (
            <button onClick={() => setStatus("active")} disabled={busy} style={btn}>重新激活</button>
          )}
          <button onClick={del} disabled={busy} style={{ ...btn, color: "var(--danger)", borderColor: "rgba(192,88,74,.4)" }}>删除</button>
        </div>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = { padding: ".28rem .7rem", borderRadius: 999, border: "1.5px solid var(--line)", background: "transparent", fontSize: ".74rem", fontWeight: 700, color: "var(--ink2)", cursor: "pointer" };

"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RECORD_TYPES } from "@/lib/labels";

function IconCalendar({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  );
}

export function RecordFilter({ type, date }: { type: string; date: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const dateRef = useRef<HTMLInputElement>(null);

  function setParam(key: string, val: string) {
    const next = new URLSearchParams(sp.toString());
    if (val) next.set(key, val);
    else next.delete(key);
    router.push(`/records/history${next.toString() ? "?" + next.toString() : ""}`);
  }

  function openPicker() {
    const el = dateRef.current;
    if (!el) return;
    // 现代浏览器：直接弹原生日历
    const anyEl = el as HTMLInputElement & { showPicker?: () => void };
    if (typeof anyEl.showPicker === "function") anyEl.showPicker();
    else el.focus();
  }

  const chips = [{ value: "", label: "全部" }, ...RECORD_TYPES.map((t) => ({ value: t.value, label: t.label }))];

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1.8rem" }}>
      <div style={{ display: "flex", gap: ".45rem", flexWrap: "wrap" }}>
        {chips.map((c) => {
          const active = type === c.value;
          return (
            <button
              key={c.value || "all"}
              onClick={() => setParam("type", c.value)}
              style={{
                padding: ".3rem .85rem",
                borderRadius: 999,
                border: "1.5px solid",
                borderColor: active ? "var(--ink)" : "var(--line)",
                background: active ? "var(--ink)" : "transparent",
                color: active ? "#fff" : "var(--ink2)",
                fontWeight: 700,
                fontSize: ".8rem",
                cursor: "pointer",
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: ".5rem", position: "relative" }}>
        {date && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", fontSize: ".8rem", fontWeight: 700, color: "var(--ink2)", background: "var(--rose-soft)", borderRadius: 999, padding: ".25rem .7rem" }}>
            {date}
            <button onClick={() => setParam("date", "")} aria-label="清除日期" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rose-deep)", fontWeight: 800, lineHeight: 1, fontSize: ".9rem" }}>×</button>
          </span>
        )}
        <button
          onClick={openPicker}
          aria-label="按日期筛选"
          title="按日期筛选"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1.5px solid",
            borderColor: date ? "var(--ink)" : "var(--line)",
            background: date ? "var(--ink)" : "transparent",
            color: date ? "#fff" : "var(--ink2)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <IconCalendar size={17} />
        </button>
        {/* 隐形的原生日期输入，由图标触发 */}
        <input
          ref={dateRef}
          type="date"
          value={date}
          onChange={(e) => setParam("date", e.target.value)}
          style={{ position: "absolute", right: 0, bottom: 0, width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

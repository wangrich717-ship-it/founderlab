"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RECORD_TYPES } from "@/lib/labels";

export function RecordFilter({ type, date }: { type: string; date: string }) {
  const router = useRouter();
  const sp = useSearchParams();

  function setParam(key: string, val: string) {
    const next = new URLSearchParams(sp.toString());
    if (val) next.set(key, val);
    else next.delete(key);
    router.push(`/records${next.toString() ? "?" + next.toString() : ""}`);
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
      <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setParam("date", e.target.value)}
          className="field-input"
          style={{ width: "auto", padding: ".4rem .7rem", fontSize: ".82rem", fontWeight: 700 }}
        />
        {date && (
          <button
            onClick={() => setParam("date", "")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink2)", fontSize: ".8rem", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            清除
          </button>
        )}
      </div>
    </div>
  );
}

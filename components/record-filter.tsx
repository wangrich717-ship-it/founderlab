"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RECORD_TYPES } from "@/lib/labels";

const RANGES = [
  { value: "", label: "全部时间" },
  { value: "7", label: "近 7 天" },
  { value: "30", label: "近 30 天" },
  { value: "90", label: "近 90 天" },
  { value: "365", label: "近一年" },
];

export function RecordFilter({ type, range }: { type: string; range: string }) {
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
      <select
        value={range}
        onChange={(e) => setParam("range", e.target.value)}
        className="field-input"
        style={{ width: "auto", padding: ".4rem .8rem", fontSize: ".82rem", fontWeight: 700 }}
      >
        {RANGES.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
    </div>
  );
}

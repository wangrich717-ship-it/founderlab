"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INSPIRATION_STATUS } from "@/lib/labels";

export function InspirationStatus({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function set(next: string) {
    if (next === status) return;
    setBusy(true);
    await fetch(`/api/inspiration/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
      {INSPIRATION_STATUS.map((s) => {
        const active = s.value === status;
        return (
          <button
            key={s.value}
            onClick={() => set(s.value)}
            disabled={busy}
            style={{
              padding: ".22rem .7rem",
              borderRadius: 999,
              border: "1.5px solid",
              borderColor: active ? "var(--chestnut)" : "var(--ink-line)",
              background: active ? "var(--chestnut)" : "transparent",
              color: active ? "#fff" : "var(--txt2)",
              fontWeight: 700,
              fontSize: ".72rem",
              cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

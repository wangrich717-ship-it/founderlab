"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function mark() {
    setBusy(true);
    await fetch(`/api/insights/${id}/read`, { method: "POST" });
    router.refresh();
  }

  return (
    <button
      onClick={mark}
      disabled={busy}
      style={{
        background: "none",
        border: "1.5px solid var(--ink-line)",
        borderRadius: 999,
        padding: ".25rem .8rem",
        fontSize: ".74rem",
        fontWeight: 700,
        color: "var(--txt2)",
        cursor: "pointer",
      }}
    >
      标记已读
    </button>
  );
}

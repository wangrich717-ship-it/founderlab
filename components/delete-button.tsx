"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ url }: { url: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm("确定删除这条记录？")) return;
    setBusy(true);
    await fetch(url, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      title="删除"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--muted)",
        fontSize: ".75rem",
        padding: ".2rem .4rem",
      }}
    >
      删除
    </button>
  );
}

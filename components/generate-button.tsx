"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateButton({
  url,
  label,
  loadingLabel,
}: {
  url: string;
  label: string;
  loadingLabel: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true);
    setErr("");
    const res = await fetch(url, { method: "POST" });
    const d = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setErr(d.error || "生成失败");
      return;
    }
    router.refresh();
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexWrap: "wrap" }}>
      <button className="btn btn-pri" onClick={run} disabled={loading}>
        {loading ? loadingLabel : label}
      </button>
      {err && <span style={{ color: "var(--danger)", fontSize: ".82rem" }}>{err}</span>}
    </div>
  );
}

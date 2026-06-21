"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function GenerateButton({
  url,
  label,
  loadingLabel,
  redirectPrefix,
}: {
  url: string;
  label: string;
  loadingLabel: string;
  redirectPrefix?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!err) return;
    const t = setTimeout(() => setErr(""), 5000);
    return () => clearTimeout(t);
  }, [err]);

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
    if (redirectPrefix && d.id) {
      router.push(`${redirectPrefix}/${d.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <button className="btn btn-pri" onClick={run} disabled={loading}>
        {loading ? loadingLabel : label}
      </button>
      {err && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 300,
            maxWidth: "90vw",
            background: "var(--ink)",
            color: "#fff",
            padding: ".75rem 1.2rem",
            borderRadius: 12,
            fontSize: ".88rem",
            lineHeight: 1.5,
            boxShadow: "0 12px 32px rgba(32,32,29,.25)",
          }}
        >
          {err}
        </div>
      )}
    </>
  );
}

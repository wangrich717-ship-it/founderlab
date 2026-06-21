"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// 进入历史页时，兜底触发对未打标记录的 AI 处理，完成后刷新一次。
export function ProcessPending({ hasPending }: { hasPending: boolean }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (!hasPending || ran.current) return;
    ran.current = true;
    (async () => {
      try {
        const res = await fetch("/api/records/process-pending", { method: "POST" });
        const d = await res.json().catch(() => ({}));
        if (res.ok && d.processed > 0) router.refresh();
      } catch {
        /* 忽略 */
      }
    })();
  }, [hasPending, router]);

  return null;
}

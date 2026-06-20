"use client";

import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 620,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(32,32,29,.45)", backdropFilter: "blur(2px)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 1rem", overflowY: "auto" }}
    >
      <div onClick={(e) => e.stopPropagation()} className="card reveal" style={{ width: "100%", maxWidth, padding: "1.6rem 1.8rem 1.9rem", borderRadius: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <h3 className="font-serif-d" style={{ fontSize: "1.4rem", fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} aria-label="关闭" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", color: "var(--ink2)", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

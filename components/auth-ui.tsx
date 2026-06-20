"use client";

import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: "2.5rem 2.25rem" }}>
        <Link href="/" className="kicker" style={{ textDecoration: "none" }}>
          ← FOUNDER LAB
        </Link>
        <h1 className="font-serif-d" style={{ fontSize: "2rem", fontWeight: 400, margin: ".75rem 0 .25rem" }}>
          {title}
        </h1>
        <p style={{ color: "var(--txt2)", fontSize: ".9rem", marginBottom: "1.75rem" }}>{subtitle}</p>
        {children}
        <p style={{ marginTop: "1.5rem", fontSize: ".85rem", color: "var(--txt2)", textAlign: "center" }}>
          {footer}
        </p>
      </div>
    </main>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

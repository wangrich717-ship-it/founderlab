"use client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }
  return (
    <button
      onClick={logout}
      className="font-mono-x"
      style={{
        background: "none",
        border: "none",
        fontSize: ".6rem",
        letterSpacing: ".15em",
        textTransform: "uppercase",
        color: "var(--muted)",
        cursor: "pointer",
      }}
    >
      退出登录
    </button>
  );
}

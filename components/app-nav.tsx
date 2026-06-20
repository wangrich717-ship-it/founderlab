import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { UserMenu } from "./user-menu";

export function AppNav({ nickname }: { nickname?: string | null }) {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.1rem 2rem",
        borderBottom: "1px solid var(--bdr)",
        background: "var(--bg-card)",
      }}
    >
      <Link href="/dashboard" className="kicker" style={{ textDecoration: "none" }}>
        FOUNDER LAB · 创业者手札
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        {nickname && <UserMenu nickname={nickname} />}
        <LogoutButton />
      </div>
    </nav>
  );
}

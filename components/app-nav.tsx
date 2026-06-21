import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { UserMenu } from "./user-menu";

export async function AppNav({ nickname }: { nickname?: string | null }) {
  let name = nickname;
  if (name === undefined || name === null) {
    const u = await getCurrentUser();
    name = u?.nickname || null;
  }
  const display = name || "我的账户";

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
      <UserMenu nickname={display} />
    </nav>
  );
}

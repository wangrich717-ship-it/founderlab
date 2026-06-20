import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";
import { UserActions } from "@/components/user-actions";

export default async function AdminUsersPage() {
  const admin = await getAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  const counts = await prisma.profile.groupBy({ by: ["userId"], _count: { _all: true } });
  const cmap = new Map(counts.map((c) => [c.userId, c._count._all]));

  return (
    <main style={{ padding: "2.5rem 2.4rem 4rem", maxWidth: 1000 }}>
      <p className="kicker">Users</p>
      <h1 className="font-serif-d" style={{ fontSize: "2.2rem", fontWeight: 700, margin: ".3rem 0 1.6rem" }}>用户管理 · {users.length}</h1>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".88rem" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".08em" }}>
              <Th>邮箱 / 昵称</Th>
              <Th>角色</Th>
              <Th>验证</Th>
              <Th>画像</Th>
              <Th>注册时间</Th>
              <Th style={{ textAlign: "right" }}>操作</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid var(--line)" }}>
                <Td>
                  <Link href={`/admin/users/${u.id}`} style={{ fontWeight: 700, color: "var(--ink)", textDecoration: "underline", textUnderlineOffset: 3 }}>{u.email}</Link>
                  <div style={{ color: "var(--muted)", fontSize: ".78rem" }}>{u.nickname}</div>
                </Td>
                <Td>
                  <span style={{ fontWeight: 700, color: u.role === "admin" ? "var(--rose-deep)" : "var(--ink2)" }}>{u.role === "admin" ? "管理员" : "用户"}</span>
                </Td>
                <Td>{u.emailVerified ? "✓" : <span style={{ color: "var(--muted)" }}>—</span>}</Td>
                <Td>{cmap.get(u.id) || 0}</Td>
                <Td style={{ color: "var(--ink2)", fontSize: ".8rem" }}>{u.createdAt.toLocaleDateString("zh-CN")}</Td>
                <Td style={{ textAlign: "right" }}>
                  <UserActions id={u.id} role={u.role} isSelf={admin?.id === u.id} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <th style={{ padding: ".9rem 1.1rem", fontWeight: 800, ...style }}>{children}</th>;
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: ".85rem 1.1rem", verticalAlign: "middle", ...style }}>{children}</td>;
}

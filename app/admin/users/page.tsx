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
              <Th>AI 权限</Th>
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
                <Td>
                  {u.role === "admin" ? (
                    <span style={{ color: "#3f7a52", fontWeight: 700, fontSize: ".8rem" }}>无限</span>
                  ) : aiActive(u.aiAccessUntil) ? (
                    <span style={{ color: "#3f7a52", fontWeight: 700, fontSize: ".8rem" }}>至 {u.aiAccessUntil!.toLocaleDateString("zh-CN")}</span>
                  ) : (
                    <span style={{ color: "var(--muted)", fontSize: ".8rem" }}>{u.aiAccessUntil ? "已过期" : "未开通"}</span>
                  )}
                </Td>
                <Td>{u.emailVerified ? "✓" : <span style={{ color: "var(--muted)" }}>—</span>}</Td>
                <Td>{cmap.get(u.id) || 0}</Td>
                <Td style={{ color: "var(--ink2)", fontSize: ".8rem" }}>{u.createdAt.toLocaleDateString("zh-CN")}</Td>
                <Td style={{ textAlign: "right" }}>
                  <UserActions id={u.id} role={u.role} isSelf={admin?.id === u.id} aiActive={aiActive(u.aiAccessUntil)} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function aiActive(until: Date | null) {
  return !!until && until.getTime() > Date.now();
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <th style={{ padding: ".9rem 1.1rem", fontWeight: 800, ...style }}>{children}</th>;
}
function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: ".85rem 1.1rem", verticalAlign: "middle", ...style }}>{children}</td>;
}

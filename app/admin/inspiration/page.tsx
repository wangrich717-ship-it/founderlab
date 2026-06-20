import { prisma } from "@/lib/prisma";
import { EntityAdmin } from "@/components/entity-admin";

export default async function AdminInspirationPage() {
  const items = await prisma.inspirationPrompt.findMany({ orderBy: { category: "asc" } });
  return (
    <main style={{ padding: "2.5rem 2.4rem 4rem", maxWidth: 820 }}>
      <p className="kicker">Inspiration</p>
      <h1 className="font-serif-d" style={{ fontSize: "2.2rem", fontWeight: 700, margin: ".3rem 0 .4rem" }}>灵感小问管理 · {items.length}</h1>
      <p style={{ color: "var(--ink2)", fontSize: ".95rem", marginBottom: "1.8rem" }}>「今日小问」从这里随机抽取。</p>
      <EntityAdmin
        items={items}
        apiBase="/api/admin/inspiration"
        titleKey="text"
        subKey="category"
        newLabel="新建小问"
        defaults={{ category: "", text: "", active: true }}
        fields={[
          { key: "category", label: "分类", w: 200 },
          { key: "text", label: "问题", type: "textarea" },
          { key: "active", label: "启用", type: "checkbox" },
        ]}
      />
    </main>
  );
}

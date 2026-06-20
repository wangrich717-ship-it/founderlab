import { prisma } from "@/lib/prisma";
import { EntityAdmin } from "@/components/entity-admin";

export default async function AdminQuestionsPage() {
  const items = await prisma.question.findMany({ orderBy: { orderNo: "asc" } });
  return (
    <main style={{ padding: "2.5rem 2.4rem 4rem", maxWidth: 820 }}>
      <p className="kicker">Assessment</p>
      <h1 className="font-serif-d" style={{ fontSize: "2.2rem", fontWeight: 700, margin: ".3rem 0 .4rem" }}>测评题管理 · {items.length}</h1>
      <p style={{ color: "var(--ink2)", fontSize: ".95rem", marginBottom: "1.8rem" }}>按「排序」决定答题顺序，按「维度」分组。</p>
      <EntityAdmin
        items={items}
        apiBase="/api/admin/questions"
        titleKey="text"
        subKey="dimension"
        newLabel="新建题目"
        defaults={{ dimension: "", text: "", orderNo: items.length, active: true }}
        fields={[
          { key: "dimension", label: "维度", w: 200 },
          { key: "text", label: "问题", type: "textarea" },
          { key: "orderNo", label: "排序", type: "number", w: 100 },
          { key: "active", label: "启用", type: "checkbox" },
        ]}
      />
    </main>
  );
}

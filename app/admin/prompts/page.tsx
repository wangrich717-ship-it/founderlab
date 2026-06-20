import { prisma } from "@/lib/prisma";
import { PromptEditor } from "@/components/prompt-editor";

export default async function AdminPromptsPage() {
  const list = await prisma.prompt.findMany({ orderBy: [{ key: "asc" }, { version: "desc" }] });

  return (
    <main style={{ padding: "2.5rem 2.4rem 4rem", maxWidth: 820 }}>
      <p className="kicker">Prompts</p>
      <h1 className="font-serif-d" style={{ fontSize: "2.2rem", fontWeight: 700, margin: ".3rem 0 .4rem" }}>提示词管理</h1>
      <p style={{ color: "var(--ink2)", fontSize: ".95rem", marginBottom: "1.8rem" }}>修改后立即对新的 AI 生成生效。</p>
      <PromptEditor list={list} />
    </main>
  );
}

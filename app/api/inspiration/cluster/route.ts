import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { callAI, getActivePrompt, AINotConfiguredError } from "@/lib/ai";
import { IDEA_CLUSTER_PROMPT } from "@/lib/prompts-default";
import { latestProfile, profileBlock } from "@/lib/context";

export const maxDuration = 60;

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const inspirations = await prisma.inspiration.findMany({
    where: { userId: session.uid, status: { not: "archived" } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  if (inspirations.length < 3) {
    return NextResponse.json(
      { error: "灵感太少了，先积累至少 3 条再来连点成线。" },
      { status: 400 }
    );
  }

  const profile = await latestProfile(session.uid);
  const cfg = await getActivePrompt("idea_cluster", IDEA_CLUSTER_PROMPT);
  const userMsg =
    profileBlock(profile?.contentMd) +
    `【他积累的灵感（越靠前越新）】\n` +
    inspirations.map((i, n) => `${n + 1}. ${i.rawText}`).join("\n");

  let content: string;
  try {
    content = await callAI(
      [
        { role: "system", content: cfg.content },
        { role: "user", content: userMsg },
      ],
      { model: cfg.model, temperature: cfg.temperature, type: "idea_cluster", userId: session.uid }
    );
  } catch (e) {
    if (e instanceof AINotConfiguredError) {
      return NextResponse.json(
        { error: "未配置 AI 密钥。在 .env 填入 DEEPSEEK_API_KEY 后即可使用。" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }

  // 连点成线的结果沉淀进「洞察」feed
  await prisma.insight.create({
    data: {
      userId: session.uid,
      type: "idea_cluster",
      content,
      sourceRefs: JSON.stringify({ inspirations: inspirations.length }),
      status: "unread",
    },
  });
  return NextResponse.json({ ok: true });
}

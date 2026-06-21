import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { callAI, getActivePrompt, AINotConfiguredError } from "@/lib/ai";
import { getAiAccess, NO_AI_ACCESS_MESSAGE } from "@/lib/ai-access";
import { INSPIRATION_MINE_PROMPT } from "@/lib/prompts-default";
import { latestProfile, profileBlock, userInfoBlock, nowBlock } from "@/lib/context";

const schema = z.object({
  promptId: z.string().optional(),
  rawText: z.string().trim().min(1, "先写点什么").max(4000),
});

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  if (!(await getAiAccess(session.uid)).allowed) {
    return NextResponse.json({ error: NO_AI_ACCESS_MESSAGE }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "参数错误" },
      { status: 400 }
    );
  }
  const { promptId, rawText } = parsed.data;

  let questionText = "";
  if (promptId) {
    const p = await prisma.inspirationPrompt.findUnique({ where: { id: promptId } });
    questionText = p?.text ?? "";
  }

  const profile = await latestProfile(session.uid);
  const user = await prisma.user.findUnique({ where: { id: session.uid } });
  const cfg = await getActivePrompt("inspiration_mine", INSPIRATION_MINE_PROMPT);
  const userMsg =
    nowBlock() +
    userInfoBlock(user) +
    profileBlock(profile?.contentMd) +
    (questionText ? `【小问题】${questionText}\n` : "") +
    `【他的回答 / 随手记】\n${rawText}\n`;

  let aiAngle: string | null = null;
  try {
    aiAngle = await callAI(
      [
        { role: "system", content: cfg.content },
        { role: "user", content: userMsg },
      ],
      { model: cfg.model, temperature: cfg.temperature, type: "inspiration_mine", userId: session.uid }
    );
  } catch (e) {
    if (e instanceof AINotConfiguredError) {
      aiAngle = "（未配置 AI 密钥，暂未挖掘。灵感已保存，填入 DEEPSEEK_API_KEY 后可重新挖掘。）";
    } else {
      return NextResponse.json({ error: (e as Error).message }, { status: 502 });
    }
  }

  const insp = await prisma.inspiration.create({
    data: {
      userId: session.uid,
      promptId: promptId || null,
      rawText,
      source: promptId ? "prompt" : "manual",
      aiAngle,
      status: "new",
    },
  });
  return NextResponse.json({ ok: true, id: insp.id });
}

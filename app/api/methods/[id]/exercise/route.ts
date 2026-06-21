import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { callAI, getActivePrompt, AINotConfiguredError } from "@/lib/ai";
import { getAiAccess, NO_AI_ACCESS_MESSAGE } from "@/lib/ai-access";
import { METHOD_EXERCISE_PROMPT } from "@/lib/prompts-default";
import { latestProfile, profileBlock, userInfoBlock } from "@/lib/context";

const schema = z.object({ response: z.string().trim().min(1, "先写下你的作答").max(4000) });

export const maxDuration = 60;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;

  if (!(await getAiAccess(session.uid)).allowed) {
    return NextResponse.json({ error: NO_AI_ACCESS_MESSAGE }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "参数错误" }, { status: 400 });
  }
  const { response } = parsed.data;

  const method = await prisma.method.findUnique({ where: { id } });
  if (!method) return NextResponse.json({ error: "方法不存在" }, { status: 404 });

  const profile = await latestProfile(session.uid);
  const user = await prisma.user.findUnique({ where: { id: session.uid } });
  const cfg = await getActivePrompt("method_exercise", METHOD_EXERCISE_PROMPT);
  const userMsg =
    userInfoBlock(user) +
    profileBlock(profile?.contentMd) +
    `【方法】${method.title}\n框架：${method.framework}\n心法：${method.xinfa}\n怎么用：${method.howToUse}\n\n` +
    `【练习题】${method.exercise || ""}\n\n【我的作答】\n${response}\n`;

  let aiFeedback: string;
  try {
    aiFeedback = await callAI(
      [
        { role: "system", content: cfg.content },
        { role: "user", content: userMsg },
      ],
      { model: cfg.model, temperature: cfg.temperature, type: "method_exercise", userId: session.uid }
    );
  } catch (e) {
    if (e instanceof AINotConfiguredError) {
      aiFeedback = "（未配置 AI 密钥，暂无法生成反馈。你的作答已保存，配置后可重做练习。）";
    } else {
      return NextResponse.json({ error: (e as Error).message }, { status: 502 });
    }
  }

  const rec = await prisma.methodExercise.create({
    data: { userId: session.uid, methodId: id, response, aiFeedback },
  });
  return NextResponse.json({ ok: true, id: rec.id, aiFeedback });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";
import { callAI, getActivePrompt, AINotConfiguredError } from "@/lib/ai";
import {
  INSPIRATION_MINE_PROMPT,
  METHOD_EXERCISE_PROMPT,
  INSIGHT_PROMPT,
  IDEA_CLUSTER_PROMPT,
} from "@/lib/prompts-default";
import { latestProfile, profileBlock, userInfoBlock, nowBlock } from "@/lib/context";

const schema = z.object({ kind: z.enum(["inspiration", "exercise", "insight"]), id: z.string() });

export const maxDuration = 60;

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });
  const { kind, id } = parsed.data;

  let aiType = "";
  let fallbackPrompt = "";
  let input = "";
  let userId = "";

  try {
    if (kind === "inspiration") {
      const e = await prisma.inspiration.findUnique({ where: { id } });
      if (!e) return NextResponse.json({ error: "灵感不存在" }, { status: 404 });
      userId = e.userId;
      aiType = "inspiration_mine";
      fallbackPrompt = INSPIRATION_MINE_PROMPT;
      const [user, profile] = await Promise.all([
        prisma.user.findUnique({ where: { id: e.userId } }),
        latestProfile(e.userId),
      ]);
      let questionText = "";
      if (e.promptId) {
        const p = await prisma.inspirationPrompt.findUnique({ where: { id: e.promptId } });
        questionText = p?.text ?? "";
      }
      input =
        nowBlock() +
        userInfoBlock(user) +
        profileBlock(profile?.contentMd) +
        (questionText ? `【小问题】${questionText}\n` : "") +
        `【他的回答 / 随手记】\n${e.rawText}\n`;
    } else if (kind === "exercise") {
      const e = await prisma.methodExercise.findUnique({ where: { id } });
      if (!e) return NextResponse.json({ error: "练习不存在" }, { status: 404 });
      userId = e.userId;
      aiType = "method_exercise";
      fallbackPrompt = METHOD_EXERCISE_PROMPT;
      const [user, profile, method] = await Promise.all([
        prisma.user.findUnique({ where: { id: e.userId } }),
        latestProfile(e.userId),
        prisma.method.findUnique({ where: { id: e.methodId } }),
      ]);
      input =
        nowBlock() +
        userInfoBlock(user) +
        profileBlock(profile?.contentMd) +
        `【方法】${method?.title ?? ""}\n框架：${method?.framework ?? ""}\n心法：${method?.xinfa ?? ""}\n怎么用：${method?.howToUse ?? ""}\n\n` +
        `【练习题】${method?.exercise || ""}\n\n【我的作答】\n${e.response}\n`;
    } else {
      // insight：无法逐字重建增量上下文，复用当初记录的 AI 输入
      const e = await prisma.insight.findUnique({ where: { id } });
      if (!e) return NextResponse.json({ error: "盘点不存在" }, { status: 404 });
      userId = e.userId;
      aiType = e.type === "idea_cluster" ? "idea_cluster" : "insight";
      fallbackPrompt = e.type === "idea_cluster" ? IDEA_CLUSTER_PROMPT : INSIGHT_PROMPT;
      const log = await prisma.aiLog.findFirst({
        where: { userId: e.userId, type: aiType, output: e.content },
        orderBy: { createdAt: "desc" },
      });
      if (!log?.input) {
        return NextResponse.json(
          { error: "找不到这条盘点的原始 AI 输入，无法重新生成（可能输入已过期或内容被改动）。" },
          { status: 400 }
        );
      }
      input = log.input;
    }

    const cfg = await getActivePrompt(aiType, fallbackPrompt);
    const output = await callAI(
      [
        { role: "system", content: cfg.content },
        { role: "user", content: input },
      ],
      { model: cfg.model, temperature: cfg.temperature, type: aiType, userId }
    );

    if (kind === "inspiration") await prisma.inspiration.update({ where: { id }, data: { aiAngle: output } });
    else if (kind === "exercise") await prisma.methodExercise.update({ where: { id }, data: { aiFeedback: output } });
    else await prisma.insight.update({ where: { id }, data: { content: output } });

    return NextResponse.json({ ok: true, output });
  } catch (e) {
    if (e instanceof AINotConfiguredError) {
      return NextResponse.json({ error: "未配置 AI 密钥。" }, { status: 400 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}

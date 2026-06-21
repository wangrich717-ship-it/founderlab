import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { callAI, getActivePrompt, AINotConfiguredError } from "@/lib/ai";
import { getAiAccess, NO_AI_ACCESS_MESSAGE } from "@/lib/ai-access";
import { INSIGHT_PROMPT } from "@/lib/prompts-default";
import { latestProfile, profileBlock, recordsBlock, userInfoBlock } from "@/lib/context";

export const maxDuration = 60;

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const uid = session.uid;

  if (!(await getAiAccess(uid)).allowed) {
    return NextResponse.json({ error: NO_AI_ACCESS_MESSAGE }, { status: 403 });
  }

  // 水位线：上一次洞察的生成时间。之后产生的才算「新内容」。
  const lastInsight = await prisma.insight.findFirst({
    where: { userId: uid },
    orderBy: { createdAt: "desc" },
  });
  const cutoff = lastInsight?.createdAt ?? null;
  const firstTime = !lastInsight;
  const newWhere = cutoff ? { createdAt: { gt: cutoff } } : {};

  // 增量捞取（仅上次洞察之后的新内容）
  const [newRecords, newInspirations, newExercises, newProfile, changedGoals, activeGoals] =
    await Promise.all([
      prisma.record.findMany({ where: { userId: uid, ...newWhere }, orderBy: { createdAt: "asc" }, take: 120 }),
      prisma.inspiration.findMany({ where: { userId: uid, ...newWhere }, orderBy: { createdAt: "asc" }, take: 60 }),
      prisma.methodExercise.findMany({ where: { userId: uid, ...newWhere }, orderBy: { createdAt: "asc" }, take: 60 }),
      prisma.profile.findFirst({ where: { userId: uid, ...newWhere }, orderBy: { createdAt: "desc" } }),
      cutoff ? prisma.goal.findMany({ where: { userId: uid, updatedAt: { gt: cutoff } }, take: 50 }) : Promise.resolve([]),
      prisma.goal.findMany({ where: { userId: uid, status: "active" }, take: 50 }),
    ]);

  // 是否有新活动
  const hasNew =
    newRecords.length > 0 ||
    newInspirations.length > 0 ||
    newExercises.length > 0 ||
    !!newProfile ||
    changedGoals.length > 0;

  if (!firstTime && !hasNew) {
    return NextResponse.json(
      { error: "自上次盘点后还没有新内容。先去记录、做练习或捕捉灵感，再来生成。" },
      { status: 400 }
    );
  }
  if (firstTime && newRecords.length === 0 && newInspirations.length === 0 && newExercises.length === 0) {
    return NextResponse.json(
      { error: "还没有足够的内容可供盘点，先去记录、做练习或捕捉灵感几条吧。" },
      { status: 400 }
    );
  }

  // 画像：仅在有新画像、或首次时投喂（避免每次重喂大段画像）
  const baseProfile = newProfile ?? (firstTime ? await latestProfile(uid) : null);

  // 方法练习需要带上方法名
  const methodIds = [...new Set(newExercises.map((e) => e.methodId))];
  const methods = methodIds.length
    ? await prisma.method.findMany({ where: { id: { in: methodIds } }, select: { id: true, title: true } })
    : [];
  const mTitle = new Map(methods.map((m) => [m.id, m.title]));

  // 拼上下文
  const user = await prisma.user.findUnique({ where: { id: uid } });
  let msg = userInfoBlock(user);
  if (baseProfile) msg += profileBlock(baseProfile.contentMd);
  if (lastInsight) msg += `【上一次的洞察盘点】\n${lastInsight.content}\n\n`;

  msg += "【当前目标】\n";
  msg += activeGoals.length
    ? activeGoals.map((g) => `- ${g.title}${g.detail ? `（${g.detail}）` : ""}`).join("\n") + "\n\n"
    : "（暂未设定目标）\n\n";

  msg += `【这段时间的新记录】\n${recordsBlock(newRecords)}\n\n`;

  if (newInspirations.length) {
    msg += "【新的灵感】\n" + newInspirations.map((i) => `- ${i.rawText}`).join("\n") + "\n\n";
  }
  if (newExercises.length) {
    msg += "【新的方法练习】\n" + newExercises.map((e) => `- [${mTitle.get(e.methodId) || "练习"}] ${e.response}`).join("\n") + "\n\n";
  }

  const cfg = await getActivePrompt("insight", INSIGHT_PROMPT);
  let content: string;
  try {
    content = await callAI(
      [
        { role: "system", content: cfg.content },
        { role: "user", content: msg },
      ],
      { model: cfg.model, temperature: cfg.temperature, type: "insight", userId: uid }
    );
  } catch (e) {
    if (e instanceof AINotConfiguredError) {
      return NextResponse.json({ error: "未配置 AI 密钥。在后台或 .env 配置后即可生成洞察。" }, { status: 400 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }

  const insight = await prisma.insight.create({
    data: {
      userId: uid,
      type: "summary",
      content,
      sourceRefs: JSON.stringify({
        records: newRecords.length,
        inspirations: newInspirations.length,
        exercises: newExercises.length,
        newProfile: !!newProfile,
        goals: activeGoals.length,
        basedOnLastInsight: !!lastInsight,
      }),
      status: "unread",
    },
  });
  return NextResponse.json({ ok: true, id: insight.id });
}

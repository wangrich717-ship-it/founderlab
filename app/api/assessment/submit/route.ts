import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { callAI, getActivePrompt, AINotConfiguredError } from "@/lib/ai";
import { PROFILE_REPORT_PROMPT } from "@/lib/prompts-default";
import { userInfoBlock } from "@/lib/context";

const schema = z.object({
  answers: z
    .array(z.object({ questionId: z.string(), text: z.string() }))
    .min(1),
  info: z
    .object({
      gender: z.string().optional(),
      age: z.string().optional(),
      extra: z.string().optional(),
    })
    .optional(),
});

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }
  const { answers, info } = parsed.data;

  // 取题目用于拼上下文（按维度+顺序）
  const questions = await prisma.question.findMany({ orderBy: { orderNo: "asc" } });
  const qMap = new Map(questions.map((q) => [q.id, q]));

  // 落库：测评 + 回答
  const assessment = await prisma.assessment.create({
    data: { userId: session.uid, status: "completed", completedAt: new Date() },
  });
  await prisma.assessmentAnswer.createMany({
    data: answers.map((a) => ({
      assessmentId: assessment.id,
      questionId: a.questionId,
      answerText: a.text,
    })),
  });

  // 拼用户侧 prompt（按维度分组）
  const user = await prisma.user.findUnique({ where: { id: session.uid } });
  let userMsg = userInfoBlock(user);
  if (info && (info.gender || info.age || info.extra)) {
    userMsg += "【个人基本信息】\n";
    if (info.gender) userMsg += `性别：${info.gender}\n`;
    if (info.age) userMsg += `年龄：${info.age}\n`;
    if (info.extra) userMsg += `补充：${info.extra}\n`;
    userMsg += "\n";
  }
  userMsg += "以下是我对创业者自我研究问卷的真实回答，请据此生成我的「创业者画像」：\n\n";
  let lastDim = "";
  for (const a of answers) {
    const q = qMap.get(a.questionId);
    if (!q) continue;
    if (q.dimension !== lastDim) {
      userMsg += `\n【${q.dimension}】\n`;
      lastDim = q.dimension;
    }
    userMsg += `Q：${q.text}\n答：${a.text || "（未填写）"}\n`;
  }

  const promptCfg = await getActivePrompt("profile_report", PROFILE_REPORT_PROMPT);

  let contentMd: string;
  let model = promptCfg.model;
  try {
    contentMd = await callAI(
      [
        { role: "system", content: promptCfg.content },
        { role: "user", content: userMsg },
      ],
      {
        model: promptCfg.model,
        temperature: promptCfg.temperature,
        type: "profile_report",
        userId: session.uid,
      }
    );
  } catch (e) {
    if (e instanceof AINotConfiguredError) {
      model = "none";
      contentMd =
        "## 报告待生成\n\n你的问卷回答已成功保存。当前服务端尚未配置 AI 密钥，因此暂未生成画像报告。\n\n### 如何启用\n在项目 `.env` 中填入 **DEEPSEEK_API_KEY** 后重启服务，再回到这里重新测评即可看到完整的「创业者画像」。\n\n你的回答不会丢失，随时可以重测。";
    } else {
      return NextResponse.json(
        { error: (e as Error).message || "生成失败" },
        { status: 502 }
      );
    }
  }

  const profile = await prisma.profile.create({
    data: {
      userId: session.uid,
      assessmentId: assessment.id,
      contentMd,
      model,
      promptVer: promptCfg.version,
    },
  });

  return NextResponse.json({ ok: true, profileId: profile.id });
}

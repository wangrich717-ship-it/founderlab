import { prisma } from "./prisma";
import { callAI, getActivePrompt, AINotConfiguredError } from "./ai";
import { PROFILE_REPORT_PROMPT } from "./prompts-default";
import { userInfoBlock } from "./context";

/** 基于一次测评的回答，拼出给 AI 的用户侧 prompt（按维度分组）。 */
export async function buildProfileUserMsg(assessmentId: string) {
  const answers = await prisma.assessmentAnswer.findMany({ where: { assessmentId } });
  const questions = await prisma.question.findMany({ orderBy: { orderNo: "asc" } });
  const qMap = new Map(questions.map((q) => [q.id, q]));
  // 按题目顺序排列回答
  const ordered = questions
    .map((q) => answers.find((a) => a.questionId === q.id))
    .filter(Boolean) as { questionId: string; answerText: string }[];

  let msg = "以下是我对创业者自我研究问卷的真实回答，请据此生成我的「创业者画像」：\n\n";
  let lastDim = "";
  for (const a of ordered) {
    const q = qMap.get(a.questionId);
    if (!q) continue;
    if (q.dimension !== lastDim) {
      msg += `\n【${q.dimension}】\n`;
      lastDim = q.dimension;
    }
    msg += `Q：${q.text}\n答：${a.answerText || "（未填写）"}\n`;
  }
  return msg;
}

/** 重新生成某份画像（基于其原始测评回答）。 */
export async function regenerateProfile(profileId: string): Promise<{ ok: boolean; error?: string }> {
  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile) return { ok: false, error: "画像不存在" };

  const user = await prisma.user.findUnique({ where: { id: profile.userId } });
  const userMsg = userInfoBlock(user) + (await buildProfileUserMsg(profile.assessmentId));
  const cfg = await getActivePrompt("profile_report", PROFILE_REPORT_PROMPT);

  try {
    const contentMd = await callAI(
      [
        { role: "system", content: cfg.content },
        { role: "user", content: userMsg },
      ],
      { model: cfg.model, temperature: cfg.temperature, type: "profile_report", userId: profile.userId }
    );
    await prisma.profile.update({
      where: { id: profileId },
      data: { contentMd, model: cfg.model, promptVer: cfg.version, createdAt: new Date() },
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof AINotConfiguredError) return { ok: false, error: "未配置 AI 密钥" };
    return { ok: false, error: (e as Error).message };
  }
}

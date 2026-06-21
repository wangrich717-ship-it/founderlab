import { prisma } from "./prisma";

export type AiAccess = { allowed: boolean; admin: boolean; until: Date | null };

/** 判断某用户当前是否拥有 AI 使用权限。管理员永远有权限。 */
export async function getAiAccess(userId: string): Promise<AiAccess> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, aiAccessUntil: true },
  });
  if (!user) return { allowed: false, admin: false, until: null };
  if (user.role === "admin") return { allowed: true, admin: true, until: user.aiAccessUntil };
  const allowed = !!user.aiAccessUntil && user.aiAccessUntil.getTime() > Date.now();
  return { allowed, admin: false, until: user.aiAccessUntil };
}

export const NO_AI_ACCESS_MESSAGE =
  "AI 功能尚未对你开通。可在「个人中心」用兑换码开通，或联系管理员。";

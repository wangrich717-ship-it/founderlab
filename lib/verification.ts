import { prisma } from "./prisma";

const TTL_MIN = 10;

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 位
}

/** 为用户签发一个验证码（先作废同类型旧码），返回明文验证码。 */
export async function issueCode(userId: string, type: "verify" | "reset") {
  await prisma.emailToken.updateMany({
    where: { userId, type, used: false },
    data: { used: true },
  });
  const code = genCode();
  await prisma.emailToken.create({
    data: {
      userId,
      type,
      token: code,
      expiresAt: new Date(Date.now() + TTL_MIN * 60 * 1000),
    },
  });
  return code;
}

/** 校验验证码；通过则标记为已用并返回 true。 */
export async function checkCode(userId: string, type: "verify" | "reset", code: string) {
  const rec = await prisma.emailToken.findFirst({
    where: { userId, type, token: code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!rec) return false;
  await prisma.emailToken.update({ where: { id: rec.id }, data: { used: true } });
  return true;
}

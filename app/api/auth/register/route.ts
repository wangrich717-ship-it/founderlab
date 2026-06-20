import { NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { issueCode } from "@/lib/verification";
import { sendCodeEmail } from "@/lib/mail";

async function safeSend(email: string, code: string) {
  try {
    await sendCodeEmail(email, code, "verify");
  } catch (e) {
    console.error("[register] 发送验证码失败:", (e as Error).message);
  }
}

const schema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少 6 位"),
  nickname: z.string().trim().max(40).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "参数错误" }, { status: 400 });
  }
  const { email, password, nickname } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // 已注册但未验证：允许重新发码继续完成验证
    if (!existing.emailVerified) {
      const code = await issueCode(existing.id, "verify");
      after(() => safeSend(email, code));
      return NextResponse.json({ ok: true, needVerify: true });
    }
    return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      nickname: nickname || email.split("@")[0],
    },
  });

  const code = await issueCode(user.id, "verify");
  after(() => safeSend(email, code));
  return NextResponse.json({ ok: true, needVerify: true });
}

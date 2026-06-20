import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "邮箱或密码不正确" }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { error: "邮箱尚未验证，请查收验证邮件后再登录。", needVerify: true },
      { status: 403 }
    );
  }

  await createSession({ uid: user.id, role: user.role });
  return NextResponse.json({ ok: true });
}

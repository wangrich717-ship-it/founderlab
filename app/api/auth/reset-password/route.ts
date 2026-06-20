import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { checkCode } from "@/lib/verification";

const schema = z.object({
  email: z.string().email(),
  code: z.string().trim().length(6, "请输入 6 位验证码"),
  password: z.string().min(6, "密码至少 6 位"),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "参数错误" }, { status: 400 });
  }
  const { email, code, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "验证码错误或已过期" }, { status: 400 });

  const ok = await checkCode(user.id, "reset", code);
  if (!ok) return NextResponse.json({ error: "验证码错误或已过期" }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password), emailVerified: true },
  });
  return NextResponse.json({ ok: true });
}

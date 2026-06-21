import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({ code: z.string().trim().min(1, "请输入兑换码").max(64) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "参数错误" }, { status: 400 });
  }
  const code = parsed.data.code.toUpperCase();

  const rc = await prisma.redeemCode.findUnique({ where: { code } });
  if (!rc) return NextResponse.json({ error: "兑换码无效" }, { status: 400 });
  if (rc.usedById) return NextResponse.json({ error: "该兑换码已被使用" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.uid }, select: { aiAccessUntil: true } });
  const base = user?.aiAccessUntil && user.aiAccessUntil.getTime() > Date.now() ? user.aiAccessUntil.getTime() : Date.now();
  const until = new Date(base + rc.days * 86400000);

  await prisma.$transaction([
    prisma.redeemCode.update({ where: { id: rc.id }, data: { usedById: session.uid, usedAt: new Date() } }),
    prisma.user.update({ where: { id: session.uid }, data: { aiAccessUntil: until } }),
  ]);

  return NextResponse.json({ ok: true, days: rc.days, until: until.toISOString() });
}

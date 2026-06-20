import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  nickname: z.string().trim().max(40).optional(),
  gender: z.string().trim().max(10).optional(),
  age: z.string().trim().max(10).optional(),
  background: z.string().trim().max(4000).optional(),
  onboarded: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });
  const { nickname, gender, age, background, onboarded } = parsed.data;

  await prisma.user.update({
    where: { id: session.uid },
    data: {
      ...(nickname !== undefined ? { nickname: nickname || null } : {}),
      ...(gender !== undefined ? { gender: gender || null } : {}),
      ...(age !== undefined ? { age: age ? Number(age) || null : null } : {}),
      ...(background !== undefined ? { background: background || null } : {}),
      ...(onboarded !== undefined ? { onboarded } : {}),
    },
  });
  return NextResponse.json({ ok: true });
}

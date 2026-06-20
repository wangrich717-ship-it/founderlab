import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  title: z.string().trim().min(1, "目标不能为空").max(200),
  detail: z.string().trim().max(2000).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "参数错误" }, { status: 400 });
  }
  const g = await prisma.goal.create({
    data: { userId: session.uid, title: parsed.data.title, detail: parsed.data.detail || null },
  });
  return NextResponse.json({ ok: true, id: g.id });
}

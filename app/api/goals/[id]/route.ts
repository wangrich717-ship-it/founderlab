import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  detail: z.string().trim().max(2000).optional(),
  status: z.enum(["active", "done", "dropped"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const g = await prisma.goal.findUnique({ where: { id } });
  if (!g || g.userId !== session.uid) return NextResponse.json({ error: "不存在" }, { status: 404 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });
  await prisma.goal.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const g = await prisma.goal.findUnique({ where: { id } });
  if (!g || g.userId !== session.uid) return NextResponse.json({ error: "不存在" }, { status: 404 });
  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

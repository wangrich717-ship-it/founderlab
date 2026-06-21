import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";

const schema = z.object({
  category: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  framework: z.string().min(1).optional(),
  xinfa: z.string().min(1).optional(),
  caseText: z.string().min(1).optional(),
  howToUse: z.string().min(1).optional(),
  exercise: z.string().optional(),
  sources: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  orderNo: z.number().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });
  await prisma.method.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await params;
  await prisma.method.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

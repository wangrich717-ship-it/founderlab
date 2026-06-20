import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";
import { regenerateProfile } from "@/lib/profile";

export const maxDuration = 60;

const schema = z.object({ contentMd: z.string().min(1) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });
  await prisma.profile.update({ where: { id }, data: { contentMd: parsed.data.contentMd } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await params;
  await prisma.profile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await params;
  const r = await regenerateProfile(id);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 502 });
  const updated = await prisma.profile.findUnique({ where: { id }, select: { contentMd: true } });
  return NextResponse.json({ ok: true, contentMd: updated?.contentMd });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";

const schema = z.object({ role: z.enum(["user", "admin"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });

  if (id === admin.id && parsed.data.role !== "admin") {
    return NextResponse.json({ error: "不能取消自己的管理员权限" }, { status: 400 });
  }
  await prisma.user.update({ where: { id }, data: { role: parsed.data.role } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await params;
  if (id === admin.id) return NextResponse.json({ error: "不能删除自己" }, { status: 400 });

  // 无数据库级外键，手动清理该用户的全部数据
  const assessments = await prisma.assessment.findMany({ where: { userId: id }, select: { id: true } });
  const aids = assessments.map((a) => a.id);
  await prisma.$transaction([
    prisma.assessmentAnswer.deleteMany({ where: { assessmentId: { in: aids } } }),
    prisma.assessment.deleteMany({ where: { userId: id } }),
    prisma.profile.deleteMany({ where: { userId: id } }),
    prisma.record.deleteMany({ where: { userId: id } }),
    prisma.review.deleteMany({ where: { userId: id } }),
    prisma.insight.deleteMany({ where: { userId: id } }),
    prisma.inspiration.deleteMany({ where: { userId: id } }),
    prisma.project.deleteMany({ where: { userId: id } }),
    prisma.methodFavorite.deleteMany({ where: { userId: id } }),
    prisma.emailToken.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);
  return NextResponse.json({ ok: true });
}

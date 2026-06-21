import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";

const schema = z.object({
  role: z.enum(["user", "admin"]).optional(),
  aiDays: z.number().int().optional(), // 在当前有效期基础上增加的天数（正数）
  aiRevoke: z.boolean().optional(), // true = 立即收回 AI 权限
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });
  const { role, aiDays, aiRevoke } = parsed.data;

  const data: { role?: string; aiAccessUntil?: Date | null } = {};

  if (role) {
    if (id === admin.id && role !== "admin") {
      return NextResponse.json({ error: "不能取消自己的管理员权限" }, { status: 400 });
    }
    data.role = role;
  }

  if (aiRevoke) {
    data.aiAccessUntil = null;
  } else if (aiDays && aiDays > 0) {
    const u = await prisma.user.findUnique({ where: { id }, select: { aiAccessUntil: true } });
    const base = u?.aiAccessUntil && u.aiAccessUntil.getTime() > Date.now() ? u.aiAccessUntil.getTime() : Date.now();
    data.aiAccessUntil = new Date(base + aiDays * 86400000);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "无可更新的字段" }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data });
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

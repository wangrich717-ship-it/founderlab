import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;

  const insight = await prisma.insight.findUnique({ where: { id } });
  if (!insight || insight.userId !== session.uid) {
    return NextResponse.json({ error: "不存在" }, { status: 404 });
  }
  await prisma.insight.update({ where: { id }, data: { status: "read" } });
  return NextResponse.json({ ok: true });
}

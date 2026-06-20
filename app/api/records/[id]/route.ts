import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;

  const rec = await prisma.record.findUnique({ where: { id } });
  if (!rec || rec.userId !== session.uid) {
    return NextResponse.json({ error: "不存在" }, { status: 404 });
  }
  await prisma.record.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

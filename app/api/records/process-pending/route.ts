import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { tagRecord } from "@/lib/record-tag";

export const maxDuration = 60;

// 兜底：处理当前用户尚未 AI 打标的记录（每次最多 5 条，避免超时）
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const pending = await prisma.record.findMany({
    where: { userId: session.uid, aiProcessed: false },
    orderBy: { createdAt: "asc" },
    take: 5,
    select: { id: true },
  });

  for (const r of pending) {
    await tagRecord(r.id);
  }

  return NextResponse.json({ ok: true, processed: pending.length });
}

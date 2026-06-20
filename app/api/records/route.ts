import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  type: z.enum(["note", "decision", "pitfall", "comm", "review"]),
  content: z.string().trim().min(1, "内容不能为空").max(4000),
  mood: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "参数错误" },
      { status: 400 }
    );
  }
  const { type, content, mood, tags } = parsed.data;

  const rec = await prisma.record.create({
    data: {
      userId: session.uid,
      type,
      content,
      mood: mood || null,
      tags: tags && tags.length ? JSON.stringify(tags) : null,
    },
  });
  return NextResponse.json({ ok: true, id: rec.id });
}

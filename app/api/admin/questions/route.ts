import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";

const schema = z.object({ dimension: z.string().min(1), text: z.string().min(1), orderNo: z.number().optional().default(0), active: z.boolean().optional().default(true) });

export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });
  const it = await prisma.question.create({ data: parsed.data });
  return NextResponse.json({ ok: true, id: it.id });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";

const schema = z.object({
  category: z.string().min(1),
  title: z.string().min(1),
  framework: z.string().min(1),
  xinfa: z.string().min(1),
  caseText: z.string().min(1),
  howToUse: z.string().min(1),
  exercise: z.string().optional().default(""),
  sources: z.string().optional().default(""),
  tags: z.string().optional().default(""),
  status: z.enum(["draft", "published"]).optional().default("published"),
  orderNo: z.number().optional().default(0),
});

export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "参数错误" }, { status: 400 });
  const m = await prisma.method.create({ data: parsed.data });
  return NextResponse.json({ ok: true, id: m.id });
}

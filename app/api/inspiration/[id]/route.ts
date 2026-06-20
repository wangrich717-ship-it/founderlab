import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  status: z.enum(["new", "incubating", "converted", "archived"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });

  const insp = await prisma.inspiration.findUnique({ where: { id } });
  if (!insp || insp.userId !== session.uid) {
    return NextResponse.json({ error: "不存在" }, { status: 404 });
  }
  await prisma.inspiration.update({ where: { id }, data: { status: parsed.data.status } });
  return NextResponse.json({ ok: true });
}

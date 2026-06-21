import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";

const schema = z.object({
  count: z.number().int().min(1).max(100),
  days: z.number().int().min(1).max(3650),
  note: z.string().trim().max(60).optional(),
});

// 去掉易混淆字符（0/O、1/I）
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function gen() {
  let s = "";
  for (let i = 0; i < 8; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `FL-${s.slice(0, 4)}-${s.slice(4)}`;
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });
  const { count, days, note } = parsed.data;

  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // 重试以避免极小概率撞码
    let code = gen();
    for (let t = 0; t < 5; t++) {
      const exists = await prisma.redeemCode.findUnique({ where: { code } });
      if (!exists) break;
      code = gen();
    }
    await prisma.redeemCode.create({ data: { code, days, note: note || null } });
    codes.push(code);
  }

  return NextResponse.json({ ok: true, codes });
}

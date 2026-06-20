import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { saveSettings } from "@/lib/settings";

const schema = z.object({
  aiApiKey: z.string().optional(),
  aiBaseUrl: z.string().optional(),
  aiDefaultModel: z.string().optional(),
});

export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });
  await saveSettings(parsed.data);
  return NextResponse.json({ ok: true });
}

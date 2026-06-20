import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { retryAiLog } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { id } = await params;
  const r = await retryAiLog(id);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 502 });
  return NextResponse.json({ ok: true, output: r.output });
}

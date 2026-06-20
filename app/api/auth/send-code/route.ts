import { NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { issueCode } from "@/lib/verification";
import { sendCodeEmail } from "@/lib/mail";

const schema = z.object({
  email: z.string().email(),
  purpose: z.enum(["verify", "reset"]),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: true });
  const { email, purpose } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // 始终返回 ok，避免泄露邮箱是否注册
  if (!user) return NextResponse.json({ ok: true });

  // verify 用途：已验证就不必再发
  if (purpose === "verify" && user.emailVerified) return NextResponse.json({ ok: true });

  const code = await issueCode(user.id, purpose);
  after(() =>
    sendCodeEmail(email, code, purpose).catch((e) =>
      console.error("[send-code] 发送验证码失败:", (e as Error).message)
    )
  );
  return NextResponse.json({ ok: true });
}

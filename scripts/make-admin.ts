import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log("用法: npx tsx scripts/make-admin.ts <邮箱>");
    return;
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`找不到用户: ${email}`);
    return;
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { role: "admin", emailVerified: true },
  });
  console.log(`✓ 已将 ${email} 设为管理员（并标记邮箱已验证）`);
}

main().finally(() => prisma.$disconnect());

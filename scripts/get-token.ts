import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("NO_USER");
    return;
  }
  const type = process.argv[3] || "verify";
  const tok = await prisma.emailToken.findFirst({
    where: { userId: user.id, type, used: false },
    orderBy: { createdAt: "desc" },
  });
  console.log(JSON.stringify({ verified: user.emailVerified, token: tok?.token ?? null }));
}

main().finally(() => prisma.$disconnect());

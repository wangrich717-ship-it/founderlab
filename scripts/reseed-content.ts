import { PrismaClient } from "@prisma/client";
import { METHODS } from "../prisma/methods-data";
import { INSPIRATION_PROMPTS } from "../prisma/inspiration-data";
import { QUESTIONS } from "../prisma/questions-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.question.deleteMany({});
  await prisma.question.createMany({ data: QUESTIONS.map((q, i) => ({ ...q, orderNo: i + 1 })) });
  console.log("测评题已重灌:", QUESTIONS.length, "题");

  await prisma.method.deleteMany({});
  await prisma.method.createMany({ data: METHODS.map((m, i) => ({ ...m, status: "published", orderNo: i })) });
  console.log("方法卡已重灌:", METHODS.length, "张");

  await prisma.inspirationPrompt.deleteMany({});
  await prisma.inspirationPrompt.createMany({ data: INSPIRATION_PROMPTS.map((p) => ({ ...p, active: true })) });
  console.log("灵感小问已重灌:", INSPIRATION_PROMPTS.length, "题");
}

main().finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";

const p = new PrismaClient();

async function main() {
  const qs = await p.question.findMany({ orderBy: { orderNo: "asc" } });
  const answers = qs.map((q) => ({
    questionId: q.id,
    text: `测试回答（${q.dimension}）：这是一条用于端到端验证的示例回答。`,
  }));
  writeFileSync("scripts/payload.json", JSON.stringify({ answers, info: { age: "30" } }));
  console.log("wrote", answers.length, "answers");
}

main().finally(() => p.$disconnect());

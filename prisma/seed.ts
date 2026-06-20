import { PrismaClient } from "@prisma/client";
import {
  PROFILE_REPORT_PROMPT,
  REVIEW_ASSIST_PROMPT,
  INSIGHT_PROMPT,
  INSPIRATION_MINE_PROMPT,
  IDEA_CLUSTER_PROMPT,
  METHOD_EXERCISE_PROMPT,
} from "../lib/prompts-default";
import { METHODS } from "./methods-data";
import { INSPIRATION_PROMPTS } from "./inspiration-data";
import { QUESTIONS } from "./questions-data";

const prisma = new PrismaClient();


async function upsertPrompt(key: string, content: string) {
  const exists = await prisma.prompt.findFirst({ where: { key, version: 1 } });
  if (!exists) {
    await prisma.prompt.create({ data: { key, version: 1, content, active: true } });
  }
}

async function main() {
  // 题库（仅在空时灌入，避免重复）
  if ((await prisma.question.count()) === 0) {
    await prisma.question.createMany({
      data: QUESTIONS.map((q, i) => ({ ...q, orderNo: i + 1 })),
    });
    console.log(`✓ 测评题 ${QUESTIONS.length} 条`);
  }

  if ((await prisma.inspirationPrompt.count()) === 0) {
    await prisma.inspirationPrompt.createMany({ data: INSPIRATION_PROMPTS });
    console.log(`✓ 灵感小问 ${INSPIRATION_PROMPTS.length} 条`);
  }

  if ((await prisma.method.count()) === 0) {
    await prisma.method.createMany({ data: METHODS.map((m, i) => ({ ...m, orderNo: i })) });
    console.log(`✓ 方法卡 ${METHODS.length} 条`);
  }

  await upsertPrompt("profile_report", PROFILE_REPORT_PROMPT);
  await upsertPrompt("review_assist", REVIEW_ASSIST_PROMPT);
  await upsertPrompt("insight", INSIGHT_PROMPT);
  await upsertPrompt("inspiration_mine", INSPIRATION_MINE_PROMPT);
  await upsertPrompt("idea_cluster", IDEA_CLUSTER_PROMPT);
  await upsertPrompt("method_exercise", METHOD_EXERCISE_PROMPT);
  console.log("✓ AI 提示词已就绪");

  console.log("种子数据完成。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

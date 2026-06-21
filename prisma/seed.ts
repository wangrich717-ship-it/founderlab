import { PrismaClient } from "@prisma/client";
import {
  PROFILE_REPORT_PROMPT,
  REVIEW_ASSIST_PROMPT,
  INSIGHT_PROMPT,
  INSPIRATION_MINE_PROMPT,
  IDEA_CLUSTER_PROMPT,
  METHOD_EXERCISE_PROMPT,
  RECORD_TAG_PROMPT,
} from "../lib/prompts-default";
import { METHODS } from "./methods-data";
import { INSPIRATION_PROMPTS } from "./inspiration-data";
import { QUESTIONS } from "./questions-data";

const prisma = new PrismaClient();


// 同步提示词：DB 没有则创建；代码默认值变了则升一个新版本并启用（旧版本停用）。
// 幂等：内容与最新版一致时不做任何改动。
async function syncPrompt(key: string, content: string) {
  const latest = await prisma.prompt.findFirst({ where: { key }, orderBy: { version: "desc" } });
  if (!latest) {
    await prisma.prompt.create({ data: { key, version: 1, content, active: true } });
    console.log(`  · ${key} 初始化`);
    return;
  }
  if (latest.content === content) {
    if (!latest.active) await prisma.prompt.update({ where: { id: latest.id }, data: { active: true } });
    return;
  }
  await prisma.prompt.updateMany({ where: { key }, data: { active: false } });
  await prisma.prompt.create({ data: { key, version: latest.version + 1, content, active: true } });
  console.log(`  · ${key} 升级到 v${latest.version + 1}`);
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
  } else {
    // 已有方法卡：按标题回填「参考来源」（仅在该卡还没填来源时，避免覆盖后台手改）
    let filled = 0;
    for (const m of METHODS) {
      const r = await prisma.method.updateMany({
        where: { title: m.title, OR: [{ sources: null }, { sources: "" }] },
        data: { sources: m.sources },
      });
      filled += r.count;
    }
    if (filled) console.log(`✓ 回填方法卡参考来源 ${filled} 条`);
  }

  await syncPrompt("profile_report", PROFILE_REPORT_PROMPT);
  await syncPrompt("review_assist", REVIEW_ASSIST_PROMPT);
  await syncPrompt("insight", INSIGHT_PROMPT);
  await syncPrompt("inspiration_mine", INSPIRATION_MINE_PROMPT);
  await syncPrompt("idea_cluster", IDEA_CLUSTER_PROMPT);
  await syncPrompt("method_exercise", METHOD_EXERCISE_PROMPT);
  await syncPrompt("record_tag", RECORD_TAG_PROMPT);
  console.log("✓ AI 提示词已同步");

  console.log("种子数据完成。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

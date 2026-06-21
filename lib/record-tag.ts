import { prisma } from "./prisma";
import { callAI, getActivePrompt } from "./ai";
import { RECORD_TAG_PROMPT } from "./prompts-default";

const VALID_TYPES = ["note", "decision", "pitfall", "comm", "review"];

/** 对一条记录做 AI 自动归类 + 关键词提取，并写回记录。失败静默（不影响主流程）。 */
export async function tagRecord(recordId: string): Promise<void> {
  try {
    const rec = await prisma.record.findUnique({ where: { id: recordId } });
    if (!rec) return;

    const cfg = await getActivePrompt("record_tag", RECORD_TAG_PROMPT);
    const raw = await callAI(
      [
        { role: "system", content: cfg.content },
        { role: "user", content: rec.content },
      ],
      { model: cfg.model, temperature: 0.2, type: "record_tag", userId: rec.userId }
    );

    // 容错解析：抽出第一个 JSON 对象
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      await prisma.record.update({ where: { id: recordId }, data: { aiProcessed: true } });
      return;
    }
    const parsed = JSON.parse(match[0]) as {
      type?: string;
      emotions?: string[];
      people?: string[];
      topics?: string[];
    };

    const type = parsed.type && VALID_TYPES.includes(parsed.type) ? parsed.type : rec.type;
    const keywords = {
      emotions: Array.isArray(parsed.emotions) ? parsed.emotions.slice(0, 8) : [],
      people: Array.isArray(parsed.people) ? parsed.people.slice(0, 8) : [],
      topics: Array.isArray(parsed.topics) ? parsed.topics.slice(0, 8) : [],
    };

    await prisma.record.update({
      where: { id: recordId },
      data: { type, keywords: JSON.stringify(keywords), aiProcessed: true },
    });
  } catch {
    // AI 失败时记录已保存，aiProcessed 保持 false，可后续重试
  }
}

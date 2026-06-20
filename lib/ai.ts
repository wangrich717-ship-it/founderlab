import { prisma } from "./prisma";
import { resolvedAi } from "./settings";
import {
  PROFILE_REPORT_PROMPT,
  REVIEW_ASSIST_PROMPT,
  INSIGHT_PROMPT,
  INSPIRATION_MINE_PROMPT,
  IDEA_CLUSTER_PROMPT,
  METHOD_EXERCISE_PROMPT,
} from "./prompts-default";

const DEFAULT_PROMPTS: Record<string, string> = {
  profile_report: PROFILE_REPORT_PROMPT,
  review_assist: REVIEW_ASSIST_PROMPT,
  insight: INSIGHT_PROMPT,
  inspiration_mine: INSPIRATION_MINE_PROMPT,
  idea_cluster: IDEA_CLUSTER_PROMPT,
  method_exercise: METHOD_EXERCISE_PROMPT,
};

type Msg = { role: "system" | "user" | "assistant"; content: string };

export class AINotConfiguredError extends Error {
  constructor() {
    super("AI 未配置：请在 .env 填入 DEEPSEEK_API_KEY");
    this.name = "AINotConfiguredError";
  }
}

/**
 * 调用 DeepSeek（OpenAI 兼容接口）。密钥仅在服务端读取。
 * type 用于成本日志归类（profile_report / review_assist / insight / inspiration_mine ...）。
 */
export async function callAI(
  messages: Msg[],
  opts: { model?: string; temperature?: number; type: string; userId?: string }
): Promise<string> {
  const ai = await resolvedAi();
  if (!ai.apiKey) throw new AINotConfiguredError();

  const base = ai.baseUrl;
  const model = opts.model || ai.defaultModel;
  const input = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n\n");

  const log = (data: { output?: string; error?: string; ok: boolean; pt?: number; ct?: number }) =>
    prisma.aiLog
      .create({
        data: {
          userId: opts.userId,
          type: opts.type,
          model,
          input,
          output: data.output ?? null,
          error: data.error ?? null,
          ok: data.ok,
          promptTokens: data.pt ?? null,
          completionTokens: data.ct ?? null,
        },
      })
      .catch(() => {});

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${ai.apiKey}` },
      body: JSON.stringify({ model, messages, temperature: opts.temperature ?? 0.75, max_tokens: 4096 }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e?.error?.message || `AI 请求失败 HTTP ${res.status}`);
    }
    const data = await res.json();
    const usage = data.usage || {};
    const output = data.choices?.[0]?.message?.content ?? "";
    log({ output, ok: true, pt: usage.prompt_tokens, ct: usage.completion_tokens });
    return output;
  } catch (e) {
    log({ error: (e as Error).message, ok: false });
    throw e;
  }
}

/** 基于一条 AI 日志的输入，用对应提示词重跑一次（管理员重试用）。 */
export async function retryAiLog(logId: string): Promise<{ ok: boolean; output?: string; error?: string }> {
  const log = await prisma.aiLog.findUnique({ where: { id: logId } });
  if (!log) return { ok: false, error: "日志不存在" };
  if (!log.input) return { ok: false, error: "该调用未记录输入，无法重试" };
  const cfg = await getActivePrompt(log.type, DEFAULT_PROMPTS[log.type] || "你是一位助手。");
  try {
    const output = await callAI(
      [
        { role: "system", content: cfg.content },
        { role: "user", content: log.input },
      ],
      { model: cfg.model, temperature: cfg.temperature, type: log.type, userId: log.userId ?? undefined }
    );
    return { ok: true, output };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** 从 prompts 表取启用中的最新版提示词；取不到回退到内置默认。 */
export async function getActivePrompt(key: string, fallback: string) {
  const p = await prisma.prompt.findFirst({
    where: { key, active: true },
    orderBy: { version: "desc" },
  });
  const ai = await resolvedAi();
  return {
    content: p?.content ?? fallback,
    model: p?.model ?? ai.defaultModel,
    temperature: p?.temperature ?? 0.75,
    version: p?.version ?? 0,
  };
}

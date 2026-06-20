import { prisma } from "./prisma";

// 应用级配置存于数据库（Setting 表），可在后台编辑，覆盖 .env 默认值。
// 之所以用 DB 而非文件：serverless 平台（Vercel）文件系统不持久。

export type AppSettings = {
  aiApiKey?: string;
  aiBaseUrl?: string;
  aiDefaultModel?: string;
};

const KEYS: (keyof AppSettings)[] = ["aiApiKey", "aiBaseUrl", "aiDefaultModel"];

export async function getSettings(): Promise<AppSettings> {
  try {
    const rows = await prisma.setting.findMany({ where: { key: { in: KEYS as string[] } } });
    const out: AppSettings = {};
    for (const r of rows) (out as Record<string, string>)[r.key] = r.value;
    return out;
  } catch {
    return {};
  }
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    await prisma.setting.upsert({
      where: { key: k },
      update: { value: String(v) },
      create: { key: k, value: String(v) },
    });
  }
  return getSettings();
}

/** 合并 DB 配置与 .env，得到实际生效的 AI 参数。 */
export async function resolvedAi() {
  const s = await getSettings();
  return {
    apiKey: s.aiApiKey || process.env.DEEPSEEK_API_KEY || "",
    baseUrl: s.aiBaseUrl || process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
    defaultModel: s.aiDefaultModel || process.env.AI_DEFAULT_MODEL || "deepseek-chat",
  };
}
